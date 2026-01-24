import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const mainHandler = async () => {
  const client = new DynamoDBClient();
  const docClient = DynamoDBDocumentClient.from(client);

  const HEALTH_SYSTEM_TABLE = process.env.HEALTH_SYSTEM_TABLE;
  const command = new PutCommand({
    TableName: HEALTH_SYSTEM_TABLE,
    Item: {
      PK: `COUNTRY#002`,
      SK: "METADATA",
      name: `Chile`,
      code: `CL`,
    },
  });

  const response = await docClient.send(command);
  return { response };
};
