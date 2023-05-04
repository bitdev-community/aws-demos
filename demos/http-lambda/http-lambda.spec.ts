import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler } from "./http-lambda.handler";

it("Should retrieve a 200 response with method name and path used in the request", async () => {
  expect.hasAssertions();
  const data = {
    method: 'GET',
    path: 'api/hello'
  };
  const expected = {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  const response = await handler({
    requestContext: {
      http: {
        method: 'GET',
        path: 'api/hello'
      }
    }
  } as APIGatewayProxyEventV2);
  expect(response).toStrictEqual(expected);
});
