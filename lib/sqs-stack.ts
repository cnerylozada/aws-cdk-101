import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import path from "path";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sns_subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class SQSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = new cdk.CfnParameter(this, "environment", {
      type: "String",
      default: "dev",
    });

    const mainQueue = new sqs.Queue(this, "mainQueue", {
      queueName: `mainQueue_${environment.valueAsString}`,
      visibilityTimeout: cdk.Duration.seconds(30),
      retentionPeriod: cdk.Duration.minutes(10),
      receiveMessageWaitTime: cdk.Duration.seconds(10),
    });

    const errorTopic = new sns.Topic(this, "errorTopic", {
      topicName: `errorTopic_${environment.valueAsString}`,
    });
    errorTopic.addSubscription(
      new sns_subscriptions.EmailSubscription(`cnerylozada@gmail.com`)
    );

    const sourceFunctionName = "source";
    const source = new NodejsFunction(this, sourceFunctionName, {
      functionName: `${sourceFunctionName}_${environment.valueAsString}`,
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, `/../resources/sqs/${sourceFunctionName}.ts`),
      handler: `mainHandler`,
      environment: {
        QUEUE_URL: mainQueue.queueUrl,
        ERROR_TOPIC_ARN: errorTopic.topicArn,
      },
    });
    mainQueue.grantSendMessages(source);
    errorTopic.grantPublish(source);

    const consumerFunctionName = "consumer";
    const consumer = new NodejsFunction(this, consumerFunctionName, {
      functionName: `${consumerFunctionName}_${environment.valueAsString}`,
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(
        __dirname,
        `/../resources/sqs/${consumerFunctionName}.ts`
      ),
      handler: "mainHandler",
      environment: {
        QUEUE_URL: mainQueue.queueUrl,
        ERROR_TOPIC_ARN: errorTopic.topicArn,
      },
    });
    consumer.addEventSource(
      new SqsEventSource(mainQueue, {
        batchSize: 3,
      })
    );
    errorTopic.grantPublish(consumer);
  }
}
