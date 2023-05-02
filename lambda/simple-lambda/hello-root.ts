import moment from "moment";

export async function handler(
  event: {},
  context?: undefined
) {
  const data = {
    greeting: `Hello!. It is the year ${moment().format("YYYY")}`,
  };
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}
