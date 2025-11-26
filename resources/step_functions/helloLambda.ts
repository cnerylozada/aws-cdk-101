import { Handler } from "aws-lambda";

export const handler: Handler = async (rawUser: { id: string }) => {
  const user = { id: rawUser.id, name: "cristh", age: 32 };
  return {
    response: user,
  };
};
