import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(5),
  age: z.number().int().min(18),
});

export const mainHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = schema.parse(JSON.parse(event.body ?? "{}"));

    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.issues }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error }),
      };
    }
  }
};
