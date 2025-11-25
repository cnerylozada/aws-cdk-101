import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export class TokenDistributionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = new cdk.CfnParameter(this, "environment", {
      type: "String",
      default: "dev",
    });

    const mainBucket = new s3.Bucket(this, `daily-node-rewards-tracking`, {
      bucketName: `daily-node-rewards-tracking-${environment.valueAsString}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaName = "storeDailyTokenDistribution";
    const storeDailyDistributionLambda = new NodejsFunction(
      this,
      "storeDailyTokenDistribution",
      {
        functionName: `storeDailyTokenDistribution_${environment.valueAsString}`,
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, `/../resources/${lambdaName}.ts`),
        handler: `mainHandler`,
        environment: {
          BUCKET: mainBucket.bucketName,
          REGION: this.region,
        },
      }
    );
    mainBucket.grantReadWrite(storeDailyDistributionLambda);

    // Define the Lambda function URL resource
    const myFunctionUrl = storeDailyDistributionLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this, "myFunctionUrlOutput", {
      value: myFunctionUrl.url,
    });
  }
}
