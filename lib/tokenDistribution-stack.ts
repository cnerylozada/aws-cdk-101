import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class TokenDistributionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = new cdk.CfnParameter(this, "environment", {
      type: "String",
      default: "dev",
    });

    const bucket = new s3.Bucket(this, `demo-bucket`, {
      bucketName: `bucket-${this.account}-${environment.valueAsString}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const functionName = "helloWorldLambda";
    const myFuction = new lambda.Function(this, "helloWorldLambda", {
      functionName: functionName,
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(`resources`),
      handler: `${functionName}.mainHanlder`,
    });
  }
}
