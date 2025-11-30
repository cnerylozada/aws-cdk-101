import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path from "path";

export class EventBridgeStack extends cdk.Stack {
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

    const errorTopicSNS = new sns.Topic(this, "errorTopic", {
      topicName: `errorTopic_${environment.valueAsString}`,
    });
    errorTopicSNS.addSubscription(
      new subscriptions.EmailSubscription("cnerylozada@gmail.com")
    );

    const functionName = `lambda1`;
    const uploadFileLambda = new NodejsFunction(this, functionName, {
      functionName: `${functionName}_${environment.valueAsString}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, `/../resources/s3/${functionName}.ts`),
      handler: "mainHandler",
      environment: {
        BUCKET: bucket.bucketName,
        TOPIC_ARN: errorTopicSNS.topicArn,
      },
    });

    bucket.grantReadWrite(uploadFileLambda);
    errorTopicSNS.grantPublish(uploadFileLambda);
  }
}
