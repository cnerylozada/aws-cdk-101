import { Handler } from "aws-lambda";

export const mainHandler: Handler = async () => {
  return { status: 200, body: { message: "hi rule!" } };
};
