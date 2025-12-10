import { Handler } from "aws-lambda";

import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const messageList = Array.from({ length: 7 }).map((_, i) => ({
  orderId: `${i + 1}`,
  timestamp: new Date().toISOString(),
}));

export const mainHandler: Handler = async () => {
  const queueUrl = process.env.QUEUE_URL;

  const errorTopicArn = process.env.ERROR_TOPIC_ARN;
  const errorTopic = new SNSClient({});

  try {
    if (!queueUrl || !errorTopicArn)
      throw new Error(`QUEUE_URL or ERROR_TOPIC_ARN env are missed`);

    const mainQueue = new SQSClient({});

    await Promise.all(
      messageList.map((_) => {
        const command = new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(_),
        });
        return mainQueue.send(command);
      })
    );
    return { body: "messages sent" };
  } catch (error) {
    console.log(`mainHandler error:`, error);
    await errorTopic.send(
      new PublishCommand({
        Message: `Something went wrong, error: ${error}`,
        TopicArn: errorTopicArn,
      })
    );
    return { body: `Something went wrong, error: ${error}` };
  }
};
