import { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithRequestContext } from "aws-lambda";

/* Using APIGatewayProxyEventV2 @Type for function URL params */
export async function handler(
  event: APIGatewayProxyEventV2, context?: APIGatewayProxyEventV2WithRequestContext<APIGatewayProxyEventV2>
) {
  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;
  const queryParams = event.queryStringParameters;

  console.log(`Received http ${method} for the path ${path} and query params ${queryParams}`);

  const data = {
    method: method,
    path: path,
    queryParams: queryParams
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}
