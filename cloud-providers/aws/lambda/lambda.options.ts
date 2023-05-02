import { LambdaClientConfig } from '@aws-sdk/client-lambda';

export type LambdaDeployOptions = {
  clientConfig: LambdaClientConfig;
  functionName: string;
  runtime: Runtime;
  description?: string;
  roleArn?: string;
  handlerName: string;
  urlOptions?: LambdaUrlOptions
};

export type LambdaUrlOptions = {
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

export type LambdaApp = {
  name: string;
  entry: string;
  deployOptions: LambdaDeployOptions
  portRange?: [number, number];
};
