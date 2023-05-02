import {
  AddPermissionCommand,
  CreateFunctionCommand,
  CreateFunctionCommandInput,
  CreateFunctionUrlConfigCommand,
  CreateFunctionUrlConfigCommandInput,
  GetFunctionCommand,
  GetFunctionCommandOutput,
  LambdaClient,
  UpdateFunctionCodeCommand,
  UpdateFunctionCodeCommandInput,
  UpdateFunctionUrlConfigCommand,
  UpdateFunctionUrlConfigCommandInput,
} from '@aws-sdk/client-lambda';
import { AppBuildContext, AppBuildResult, AppContext, AppDeployContext, Application } from '@teambit/application';
import { Port } from '@teambit/toolbox.network.get-port';
import archiver from 'archiver';
import { createWriteStream, readFileSync } from 'fs';
import { watch } from 'lambda-local';
import { join, parse } from 'path';
import { webpack } from 'webpack';
import { LambdaDeployOptions, LambdaUrlOptions } from './lambda.options';
import { IAMClient, CreateRoleCommand, AttachRolePolicyCommand, Role } from '@aws-sdk/client-iam';


export class LambdaApp implements Application {
  private lambdaClient: LambdaClient;
  constructor(
    readonly name: string,
    readonly entry: string,
    readonly options: LambdaDeployOptions,
    readonly portRange: number[]
  ) {
    this.lambdaClient = new LambdaClient(this.options.clientConfig);
  }
  applicationType = 'lambda';
  private zipLocation = 'lambda.app.zip';
  private lambdaFileName = 'lambda_bundle.js';

  async run(context: AppContext): Promise<number> {
    const port = await Port.getPortFromRange(this.portRange);
    watch({
      lambdaPath: this.entry,
      port: port,
    });
    return port;
  }

  async build(buildContext: AppBuildContext) {
    const {
      capsule: { path: componentFolder, fs },
    } = buildContext;
    const destZipFile = fs.getPath(this.zipLocation);
    const capsuleFolder = join(componentFolder, '../');
    const lambdaFile = join(capsuleFolder, this.lambdaFileName);
    await this.bundle(capsuleFolder, this.entry);
    await this.zipBundle(lambdaFile, destZipFile);
    return {} as AppBuildResult;
  }

  private zipBundle(fileToAppend: string, outPath: string) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = createWriteStream(outPath);
    return new Promise<void>((resolve, reject) => {
      const name = parse(fileToAppend).base;
      archive
        .file(fileToAppend, { name })
        .on('error', (err) => {
          reject(err);
        })
        .pipe(stream);
      stream.on('close', () => {
        resolve();
      });
      archive.finalize();
    });
  }

  private bundle(capsuleFolder: string, entryFile: string) {
    const compiler = webpack({
      entry: require.resolve(entryFile),
      mode: 'production',
      target: 'node',
      optimization: {
        minimize: false,
      },
      performance: {
        hints: false,
      },
      output: {
        libraryTarget: 'umd',
        path: capsuleFolder,
        filename: this.lambdaFileName,
      },
    });
    return new Promise<Buffer>((resolve) => {
      compiler.run((err, stats) => {
        const buffer = readFileSync(join(capsuleFolder, this.lambdaFileName));
        return resolve(buffer);
      });
    });
  }

  private async checkLambdaExistsOnAWS(fcName: string) {
    let response: GetFunctionCommandOutput | null;
    try {
      const data = new GetFunctionCommand({ FunctionName: fcName });
      response = await this.lambdaClient.send(data);
    } catch (e) {
      response = null;
    }
    return response;
  }

  async deploy(context: AppDeployContext) {
    const {
      capsule: { path: componentFolder },
    } = context;
    const pathFolder = join(componentFolder, this.zipLocation);
    const zippedFileBuffer = readFileSync(pathFolder);
    const doesLambdaExistsInAWS = await this.checkLambdaExistsOnAWS(this.getFunctionName());
    if (doesLambdaExistsInAWS) return this.updateExistingLambda(zippedFileBuffer, this.options.urlOptions);
    return this.createNewLambda(zippedFileBuffer);
  }

  private getFunctionName() {
    return this.options.functionName;
  }

  private async createNewLambda(zipFile: Buffer) {
    const { urlOptions } = this.options;
    await this.createNewFunction(zipFile);
    if (urlOptions)
      await this.createFunctionUrlConfig(urlOptions);
  }

  private isRole(role: Role | undefined) {
    return !!role && !!role.Arn;
  }
  private sleep(ms: number): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  private async createLambdaExecutionRole() {
    /* Use Lambda Deploy Config's credentials */
    const iamClient = new IAMClient({ region: this.options.clientConfig.region, credentials: this.options.clientConfig.credentials });
    const roleParams = {
      RoleName: `LambdaExecutionRole-${Date.now()}`,
      AssumeRolePolicyDocument: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'lambda.amazonaws.com' },
            Action: 'sts:AssumeRole',
          },
        ],
      }),
    };
    const response = await iamClient.send(new CreateRoleCommand(roleParams));

    if (this.isRole(response.Role)) {
      const roleArn = response?.Role?.Arn;
      console.log(`Created IAM role: ${roleArn}`);
      await iamClient.send(new AttachRolePolicyCommand({ RoleName: roleParams.RoleName, PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole' }));
      console.log('Attached AWSLambdaBasicExecutionRole policy to the IAM role');
      return roleArn;
    } else {
      throw new Error('Error creating the role: Role or Arn is missing in the response');
    }
  }

  private async createNewFunction(zipFile: Buffer) {
    const { runtime, handlerName, roleArn, description, urlOptions } = this.options;
    const role = roleArn ?? await this.createLambdaExecutionRole();
    if (!roleArn) {
      /* Add a delay for the IAM role to propegate */
      await this.sleep(10000);
    }
    const basicParams: CreateFunctionCommandInput = {
      Code: {
        ZipFile: zipFile,
      },
      FunctionName: this.getFunctionName(),
      Handler: `${parse(this.lambdaFileName).name}.${handlerName}`,
      Role: role,
      Runtime: runtime,
      Description: description,
    };
    await this.lambdaClient.send(new CreateFunctionCommand(basicParams));
  }

  private mapFunctionUrlConfig(urlOptions: LambdaUrlOptions): CreateFunctionUrlConfigCommandInput | UpdateFunctionUrlConfigCommandInput {
    return {
      FunctionName: this.getFunctionName(),
      Qualifier: urlOptions.qualifier,
      AuthType: urlOptions.authType,
      Cors: {
        AllowCredentials: urlOptions.cors?.allowCredentials,
        AllowHeaders: urlOptions.cors?.allowHeaders,
        AllowMethods: urlOptions.cors?.allowMethods,
        AllowOrigins: urlOptions.cors?.allowOrigins,
        ExposeHeaders: urlOptions.cors?.exposeHeaders,
        MaxAge: urlOptions.cors?.maxAge,
      },
      InvokeMode: urlOptions.invokeMode,
    };
  }
  private async createFunctionUrlConfig(urlOptions: LambdaUrlOptions) {
    const urlParams = this.mapFunctionUrlConfig(urlOptions);
    await this.lambdaClient.send(new CreateFunctionUrlConfigCommand(urlParams as CreateFunctionUrlConfigCommandInput));
    if (urlOptions.authType === 'NONE') {
      await this.addPublicAccessPermission();
    }
  }

  private async addPublicAccessPermission() {
    const permissionParams = {
      FunctionName: this.getFunctionName(),
      StatementId: "FunctionURLAllowPublicAccess",
      Action: "lambda:InvokeFunctionUrl",
      Principal: "*",
      FunctionUrlAuthType: "NONE"
    };
    await this.lambdaClient.send(new AddPermissionCommand(permissionParams));
  }

  private async updateExistingLambda(zipFile: Buffer, urlOptions?: LambdaUrlOptions) {
    await this.updateExistingFunction(zipFile);
    if (urlOptions)
      await this.updateFunctionUrlConfig(urlOptions);
  }

  private async updateExistingFunction(zipFile: Buffer) {
    const basicParams: UpdateFunctionCodeCommandInput = {
      ZipFile: zipFile,
      FunctionName: this.getFunctionName(),
    };
    await this.lambdaClient.send(new UpdateFunctionCodeCommand(basicParams));
  }

  private async updateFunctionUrlConfig(urlOptions: LambdaUrlOptions) {
    const urlParams = this.mapFunctionUrlConfig(urlOptions);
    await this.lambdaClient.send(new UpdateFunctionUrlConfigCommand(urlParams as UpdateFunctionUrlConfigCommandInput));
  }
}
