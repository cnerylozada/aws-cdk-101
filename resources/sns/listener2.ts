import { SNSEvent } from "aws-lambda";

export const mainHandler = (event: SNSEvent) => {
  const record = event.Records[0];
  const { Message, MessageAttributes } = record.Sns;

  console.log(`MessageAttributes`, MessageAttributes);

  return {
    status: 200,
    body: {
      message: Message,
      messageAttributes: MessageAttributes,
    },
  };
};
