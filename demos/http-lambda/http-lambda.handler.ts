import moment from "moment";

export async function handler(
  event, context?
) {
  const data = {
    greeting: `Hello HTTP!. It is the year ${moment().format("YYYY")}`,
  };
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}
