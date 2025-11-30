import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";

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
      autoDeleteObjects: true,
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

    const helloLambda = new NodejsFunction(this, "helloLambda", {
      functionName: "helloLambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(
        __dirname,
        `/../resources/step_functions/helloLambda.ts`
      ),
      handler: "handler",
    });
    const worldLambda = new NodejsFunction(this, "worldLambda", {
      functionName: "worldLambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(
        __dirname,
        `/../resources/step_functions/worldLambda.ts`
      ),
      handler: "handler",
    });

    const helloStep = new tasks.LambdaInvoke(this, "InvokeHello", {
      lambdaFunction: helloLambda,
      inputPath: "$.rawUser",
      outputPath: "$.Payload.response",
    });
    const worldStep = new tasks.LambdaInvoke(this, "InvokeWorld", {
      lambdaFunction: worldLambda,
      outputPath: "$.Payload.response.user",
    });
    const definition = helloStep.next(worldStep);
    new sfn.StateMachine(this, "StateMachine101", {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
      stateMachineName: "StateMachine101",
    });
  }
}
