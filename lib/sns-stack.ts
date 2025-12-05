import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path from "path";
import * as scheduler from "aws-cdk-lib/aws-scheduler";
import * as targets from "aws-cdk-lib/aws-scheduler-targets";

export class SNSStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = new cdk.CfnParameter(this, "environment", {
      type: "String",
      default: "dev",
    });

    const bucketName = `bucket3011`;
    const bucket = new s3.Bucket(this, bucketName, {
      bucketName: `${bucketName}-${environment.valueAsString}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const mainTopicSNS = new sns.Topic(this, "mainTopic", {
      topicName: `mainTopic_${environment.valueAsString}`,
    });

    const errorTopicSNS = new sns.Topic(this, "errorTopic", {
      topicName: `errorTopic_${environment.valueAsString}`,
    });
    errorTopicSNS.addSubscription(
      new subscriptions.EmailSubscription("cnerylozada@gmail.com")
    );

    const functionName = `source`;
    const sourceLambda = new NodejsFunction(this, functionName, {
      functionName: `${functionName}_${environment.valueAsString}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, `/../resources/sns/${functionName}.ts`),
      handler: "mainHandler",
      environment: {
        BUCKET: bucket.bucketName,
        MAIN_TOPIC_ARN: mainTopicSNS.topicArn,
        ERROR_TOPIC_ARN: errorTopicSNS.topicArn,
      },
    });

    bucket.grantReadWrite(sourceLambda);
    mainTopicSNS.grantPublish(sourceLambda);
    errorTopicSNS.grantPublish(sourceLambda);

    new scheduler.Schedule(this, "scheduler", {
      scheduleName: "scheduler",
      schedule: scheduler.ScheduleExpression.cron({ hour: "18", minute: "08" }),
      target: new targets.LambdaInvoke(sourceLambda),
    });

    const listener1Name = "listener1";
    const listener1Lambda = new NodejsFunction(this, listener1Name, {
      functionName: `${listener1Name}_${environment.valueAsString}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, `/../resources/sns/${listener1Name}.ts`),
      handler: "mainHandler",
    });
    const listener2Name = "listener2";
    const listener2Lambda = new NodejsFunction(this, listener2Name, {
      functionName: `${listener2Name}_${environment.valueAsString}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, `/../resources/sns/${listener2Name}.ts`),
      handler: `mainHandler`,
    });

    mainTopicSNS.addSubscription(
      new subscriptions.LambdaSubscription(listener1Lambda, {
        filterPolicy: {
          color: sns.SubscriptionFilter.stringFilter({
            allowlist: ["red", "orange"],
          }),
        },
      })
    );
    mainTopicSNS.addSubscription(
      new subscriptions.LambdaSubscription(listener2Lambda)
    );
  }
}
