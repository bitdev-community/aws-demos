import { handler } from "./hello-root";

it("Should retrieve a 200 response with a greeting", async () => {
  expect.hasAssertions();
  const event = { firstName: "Bit", lastName: "Components" };
  const data = {
    greeting: `Hello ${event.firstName} ${
      event.lastName
    }!. It is the year ${new Date().getFullYear()}`,
  };
  const expected = {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  const response = await handler(event);
  expect(response).toStrictEqual(expected);
});
