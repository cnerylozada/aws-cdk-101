import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { SQSEvent, SQSHandler } from "aws-lambda";

export const mainHandler: SQSHandler = async (event: SQSEvent) => {
  const errorTopicArn = process.env.ERROR_TOPIC_ARN;
  const errorTopic = new SNSClient({});
  try {
    if (!errorTopicArn)
      throw new Error(`QUEUE_URL or ERROR_TOPIC_ARN env are missed`);

    for (const record of event.Records) {
      console.log("Received message:", record.body);
    }
  } catch (error) {
    console.log(`mainHandler error`, error);
    await errorTopic.send(
      new PublishCommand({
        Message: `Something went wrong, error: ${error}`,
        TopicArn: errorTopicArn,
      })
    );
  }
};
