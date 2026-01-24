import { DynamoDBClient, PutRequest } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

export const mainHandler = async () => {
  const client = new DynamoDBClient();
  const documentClient = DynamoDBDocumentClient.from(client);

  const healthSystemTable = process.env.HEALTH_SYSTEM_TABLE;

  const hospitalList = [
    { PK: "COUNTRY#001", SK: "HOSPITAL#001", id: "001", name: "Hospital 001" },
    { PK: "COUNTRY#001", SK: "HOSPITAL#002", id: "002", name: "Hospital 002" },
    { PK: "COUNTRY#002", SK: "HOSPITAL#003", id: "003", name: "Hospital 003" },
  ];
  const putRequestList = hospitalList.map((_) => ({
    PutRequest: {
      Item: _,
    },
  }));

  const command = new BatchWriteCommand({
    RequestItems: {
      [healthSystemTable!]: putRequestList,
    },
  });

  const response = await documentClient.send(command);
  return { response };
};
