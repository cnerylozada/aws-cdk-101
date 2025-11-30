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
    const putObjectResponse = await s3Client.send(command);
    console.log(`putObjectResponse`, putObjectResponse);

    const publishResponse = await snsClient.send(
      new PublishCommand({
        Message: `Hello from lambda!`,
        TopicArn: process.env.TOPIC_ARN,
      })
    );
    console.log(`publishResponse`, publishResponse);
  } catch (error) {
    console.log(`error`, error);
  }

  return {
    status: 200,
    body: message,
  };
};
