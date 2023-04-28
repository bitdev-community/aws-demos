import moment from "moment";

export async function handler(
  event: { firstName: string; lastName: string },
  context?: undefined
) {
  const data = {
    greeting: `Hello ${event.firstName} ${
      event.lastName
    }!. It is the year ${moment().format("YYYY")}`,
  };
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}
