import { Handler } from "aws-lambda";

export const mainHandler: Handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "mainLambda",
    }),
  };
};
