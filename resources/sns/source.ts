import { Handler } from "aws-lambda";
import { PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { getMessageList } from "./utils";

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

    const MAIN_TOPIC_ARN = process.env.MAIN_TOPIC_ARN;
    const ERROR_TOPIC_ARN = process.env.ERROR_TOPIC_ARN;
    if (!MAIN_TOPIC_ARN || !ERROR_TOPIC_ARN)
      throw new Error(
        `SNS configuration error: MAIN_TOPIC_ARN or ERROR_TOPIC_ARN is not defined. 
        This Lambda cannot publish system events or failure notifications.`
      );

    const results = await Promise.allSettled(
      getMessageList(MAIN_TOPIC_ARN).map((_) => {
        return snsClient.send(new PublishCommand(_));
      })
    );

    const failed = results.filter((_) => _.status === "rejected");
    if (!!failed.length) {
      await snsClient.send(
        new PublishCommand({
          Message: `Some SNS messages failed: ${JSON.stringify(failed)}`,
          TopicArn: ERROR_TOPIC_ARN,
        })
      );
    }
  } catch (error) {
    console.log(`error`, error);
    const ERROR_TOPIC_ARN = process.env.ERROR_TOPIC_ARN;

    await snsClient.send(
      new PublishCommand({
        Message: `Error: ${error}`,
        TopicArn: ERROR_TOPIC_ARN,
      })
    );
  }

  return {
    status: 200,
    body: { message: "source" },
  };
};
