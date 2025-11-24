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

    const bucket = new s3.Bucket(this, `mainbucket`, {
      bucketName: `mainbucket-${this.account}-${environment.valueAsString}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const functionName = "storeDailyTokenDistribution";
    const myFunction = new NodejsFunction(this, "storeDailyTokenDistribution", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, `/../resources/${functionName}.ts`),
      handler: `mainHandler`,
      environment: {
        BUCKET: bucket.bucketName,
      },
    });
    // Define the Lambda function URL resource
    const myFunctionUrl = myFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this, "myFunctionUrlOutput", {
      value: myFunctionUrl.url,
    });
  }
}
