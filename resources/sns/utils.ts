import { MessageAttributeValue } from "@aws-sdk/client-sns";

export interface ISourceMessage {
  Message: string;
  TopicArn: string;
  MessageAttributes?: Record<string, MessageAttributeValue> | undefined;
}

export const getMessageList = (topicArn: string): ISourceMessage[] => {
  return [
    {
      Message: `message from source 1`,
      TopicArn: topicArn,
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: "ORDER_CREATED",
        },
        color: { DataType: "String", StringValue: "red" },
      },
    },
    {
      Message: `message from source 2`,
      TopicArn: topicArn,
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: "ORDER_CREATED",
        },
        priority: {
          DataType: "String",
          StringValue: "high",
        },
        color: { DataType: "String", StringValue: "orange" },
        price: { DataType: "Number", StringValue: "150" },
      },
    },
    {
      Message: `message from source 3`,
      TopicArn: topicArn,
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: "ORDER_CREATED",
        },
        color: { DataType: "String", StringValue: "blue" },
      },
    },
  ];
};
