import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class Cdk101Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = new cdk.CfnParameter(this, "environment", {
      type: "String",
      default: "dev",
    });
    // const duration = new cdk.CfnParameter(this, "duration", {
    //   default: 6,
    //   minValue: 1,
    //   maxValue: 18,
    //   type: "Number",
    // });

    const bucket = new s3.Bucket(this, `demo-bucket`, {
      bucketName: `demo-bucket_${environment.valueAsString}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // new ssm.StringParameter(this, "AvatarBucket", {
    //   parameterName: "/cdk101/avatarBucket",
    //   stringValue: bucket.bucketName,
    // });

    // const marketplaceTable = new dynamodb.TableV2(this, "Table", {
    //   tableName: "marketplace",
    //   partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    // });

    // new ssm.StringParameter(this, "MarketplaceDynamoTable", {
    //   parameterName: "/cdk101/marketplaceDynamoTable",
    //   stringValue: marketplaceTable.tableName,
    // });
  }
}
