import { LambdaClientConfig } from '@aws-sdk/client-lambda';

export type LambdaDeployOptions = {
  clientConfig: LambdaClientConfig;
  functionName: string;
  runtime: Runtime;
  description?: string;
  role: string;
  handlerName: string;
};

export type LambdaAppOptions = {
  name: string;
  entry: string;
  deployOptions: LambdaDeployOptions;
  portRange?: [number, number];
};

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
  };
  portRange: [number, number];
};
