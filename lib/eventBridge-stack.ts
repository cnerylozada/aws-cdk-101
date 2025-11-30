import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import path from "path";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

export class EventBridgeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = new cdk.CfnParameter(this, "environment", {
      type: "String",
      default: "dev",
    });

    const bucketName = "bucket1214";
    const bucket = new s3.Bucket(this, bucketName, {
      bucketName: `${bucketName}-${environment.valueAsString}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      eventBridgeEnabled: true,
    });

    const functionName = `lambda1`;
    const lambda1 = new NodejsFunction(this, functionName, {
      functionName: `${functionName}_${environment.valueAsString}`,
      entry: path.join(
        __dirname,
        `/../resources/eventBridge_${functionName}.ts`
      ),
      handler: "mainHandler",
      runtime: lambda.Runtime.NODEJS_20_X,
    });

    const ruleName = `S3UploadRule`;
    const rule = new events.Rule(this, ruleName, {
      ruleName: `${ruleName}_${environment.valueAsString}`,
      eventPattern: {
        source: ["aws.s3"],
        detailType: ["Object Created"],
        detail: {
          bucket: { name: [bucket.bucketName] },
          object: {
            key: events.Match.wildcard("folder-rule/*.pdf"),
          },
        },
      },
    });
    rule.addTarget(new targets.LambdaFunction(lambda1));

    const scheduleRule = new events.Rule(this, "scheduleRule", {
      ruleName: "scheduleRule",
      schedule: events.Schedule.cron({ hour: "23", minute: "40" }),
    });
    scheduleRule.addTarget(new targets.LambdaFunction(lambda1));
  }
}
