import { handler } from "./hello-world-root";

it("Should retrieve a 200 response with a greeting", async () => {
  expect.hasAssertions();
  const data = {
    greeting: `Hello!. It is the year ${new Date().getFullYear()}`,
  };
  const expected = {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  const response = await handler({});
  expect(response).toStrictEqual(expected);
});
