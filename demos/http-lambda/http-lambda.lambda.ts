import { LambdaApp } from "@aws-lambda/provider.provider";

export const HttpLambdaApp: LambdaApp = {
  /* the app's name (for Bit) */
  name: "http-lambda",
  /* an entry point for the app's build */
  entry: require.resolve("./http-lambda.handler"),
  /* your aws host config and credentials */
  deployOptions: {
    clientConfig: {
      /* the hosting region */
      region: "us-east-1",
      /* your aws credentials */
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      },
    },
    /* the lambda's name (for aws). Using an already used name will update the code. */
    functionName: `http_lambda`,
    /* the runtime execution environment */
    runtime: "nodejs14.x",
    /* a description for your lambda (will be displayed on the aws console) */
    description: "Deployed from Bit Component",
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

export default HttpLambdaApp;
