import { LambdaApp } from "@teambit/cloud-providers.aws.lambda";

export const HelloLambdaApp: LambdaApp = {
  /* the app's name (for Bit) */
  name: "hello-lambda-app",
  /* an entry point for the app's build */
  entry: require.resolve("./hello-root"),
  /* your aws host config and credentials */
  deployOptions: {
    clientConfig: {
      /* the hosting region */
      region: "us-east-1",
      /* your aws credentials */
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      },
    },
    /* the lambda's name (for aws). Using an already used name will update the code. */
    functionName: `test_lambda_bit`,
    /* the runtime execution environment */
    runtime: "nodejs14.x",
    /* a description for your lambda (will be displayed on the aws console) */
    description: "Deployed from Bit Component",
    /* the Amazon Resource Name (ARN) of the function's execution role. */
    role: process.env.AWS_ROLE,
    /* the name of the method within your code that Lambda calls to execute your function */
    handlerName: "handler",
    /* lambda endpoint url configurations.  */
    urlOptions: {
      authType: 'NONE',
      invokeMode: 'BUFFERED',
      cors: {
        allowOrigins: ['*'],
        allowMethods: ['GET']
      }
    },
  },
  /* the port range for running the app (lambda) in development (bit run) */
  portRange: [3000, 5000],
};

export default HelloLambdaApp;
