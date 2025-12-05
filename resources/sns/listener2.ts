import { SNSEvent } from "aws-lambda";

export const mainHandler = (event: SNSEvent) => {
  event.Records.forEach((_) => {
    const { Message, MessageAttributes } = _.Sns;
    console.log(`message2`, {
      message: Message,
      messageAttributes: MessageAttributes,
    });
  });

  return {
    status: 200,
    body: {
      message: `listener2`,
    },
  };
};
