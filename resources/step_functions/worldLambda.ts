import { Handler } from "aws-lambda";

export const handler: Handler = async (user: {
  id: string;
  name: string;
  age: number;
}) => {
  console.log(`user`, user);
  return {
    response: { user },
  };
};
