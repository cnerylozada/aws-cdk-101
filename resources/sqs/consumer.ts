import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { SQSBatchResponse, SQSEvent } from "aws-lambda";

export const mainHandler = async (
  event: SQSEvent
): Promise<SQSBatchResponse> => {
  const errorTopicArn = process.env.ERROR_TOPIC_ARN;
  const errorTopic = new SNSClient({});

  const batchItemFailures: SQSBatchResponse["batchItemFailures"] = [];
  if (!errorTopicArn)
    throw new Error(`QUEUE_URL or ERROR_TOPIC_ARN env are missed`);

  for (const record of event.Records) {
    try {
      console.log("Received message:", record.body);
      const message = JSON.parse(record.body);

      if (message.orderId === "3") {
        throw new Error("Simulated failure for orderId 3");
      }
    } catch (error) {
      console.log(`mainHandler error`, error);

      await errorTopic.send(
        new PublishCommand({
          Message: `Something went wrong, error: ${error}`,
          TopicArn: errorTopicArn,
        })
      );
      batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  return { batchItemFailures };
};
