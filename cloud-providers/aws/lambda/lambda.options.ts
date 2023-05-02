import { LambdaClientConfig } from '@aws-sdk/client-lambda';

export type LambdaDeployOptions = {
  clientConfig: LambdaClientConfig;
  functionName: string;
  runtime: Runtime;
  description?: string;
  role?: string;
  handlerName: string;
  urlOptions?: LambdaUrlOptions
};

export type LambdaUrlOptions =  {
  qualifier?: string,
  authType: "NONE" | "AWS_IAM",
  cors?: {
    allowCredentials?: boolean,
    allowHeaders?: string[],
    allowMethods?: string[],
    allowOrigins?: string[],
    exposeHeaders?: string[],
    maxAge?: number,
  },
  invokeMode?: "BUFFERED" | "RESPONSE_STREAM"
}

type Runtime = 'nodejs14.x' | 'nodejs12.x' | 'nodejs10.x';

export type CreateFunctionCommandOptions = {
  Code: {
    ZipFile: Buffer;
  };
  FunctionName: string;
  Handler: string;
  Role: string;
  Runtime: Runtime;
  Description?: string;
  Architectures?: string[];
  Tags?: undefined | { [key: string]: string };
  Timeout?: undefined | number;
  KMSKeyArn?: undefined | string;
  Layers?: string[];
};

export type CreateFunctionUrlConfigCommandOptions = {
  FunctionName: string,
  Qualifier?: string,
  AuthType: "NONE" | "AWS_IAM",
  Cors?: {
    AllowCredentials?: boolean,
    AllowHeaders?: string[],
    AllowMethods?: string[],
    AllowOrigins?: string[],
    ExposeHeaders?: string[],
    MaxAge?: number,
  },
  InvokeMode?: "BUFFERED" | "RESPONSE_STREAM"
};

export type LambdaApp = {
  name: string;
  entry: string;
  deployOptions: {
    clientConfig: {
      region: string;
      credentials: {
        secretAccessKey: string;
        accessKeyId: string;
      };
    };
    functionName: string;
    runtime: Runtime;
    description?: string;
    role: string;
    handlerName: string;
    urlOptions?: {
      qualifier?: string,
      authType: "NONE" | "AWS_IAM",
      cors?: {
        allowCredentials?: boolean,
        allowHeaders?: string[],
        allowMethods?: string[],
        allowOrigins?: string[],
        exposeHeaders?: string[],
        maxAge?: number,
      },
      invokeMode?: "BUFFERED" | "RESPONSE_STREAM"
    };
  };
  portRange?: [number, number];
};
