import { handler } from "./http-lambda.handler";

it("Should retrieve a 200 response with a greeting", async () => {
  expect.hasAssertions();
  const data = {
    greeting: `Hello HTTP!. It is the year ${new Date().getFullYear()}`,
  };
  const expected = {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  const response = await handler({});
  expect(response).toStrictEqual(expected);
});
