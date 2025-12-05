import { Handler } from "aws-lambda";
import { PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

export const mainHandler: Handler = async () => {
  const config: S3ClientConfig = {};
  const s3Client = new S3Client(config);
  const snsClient = new SNSClient({});

  const message = { message: "Hello world" };
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: "lucciano/mock1132.json",
      Body: JSON.stringify(message),
    });
    await s3Client.send(command);

    await snsClient.send(
      new PublishCommand({
        Message: `message from source`,
        TopicArn: process.env.MAIN_TOPIC_ARN,
        MessageAttributes: {
          eventType: {
            DataType: "String",
            StringValue: "ORDER_CREATED",
          },
          priority: {
            DataType: "String",
            StringValue: "high",
          },
          color: { DataType: "String", StringValue: "blue" },
          price: { DataType: "Number", StringValue: "150" },
        },
      })
    );
  } catch (error) {
    console.log(`error`, error);

    await snsClient.send(
      new PublishCommand({
        Message: `Error: ${error}`,
        TopicArn: process.env.ERROR_TOPIC_ARN,
      })
    );
  }

  return {
    status: 200,
    body: message,
  };
};
