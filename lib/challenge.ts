import * as cdk from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { FunctionUrlAuthType, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import path from "path";

export class ChallengeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add("Project", "challenge");
    cdk.Tags.of(this).add("Environment", "development");

    const medicalAppointmentsApi = new RestApi(this, "medical-appointments", {
      restApiName: "medical-appointments",
    });
    const v1 = medicalAppointmentsApi.root.addResource("v1");
    const appointments = v1.addResource("appointments");

    const getFunctionName = "getAppointmentList";
    const getAppointmentList = new NodejsFunction(this, getFunctionName, {
      functionName: getFunctionName,
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(
        __dirname,
        `/../resources/challenge/${getFunctionName}.ts`,
      ),
      handler: "mainHandler",
      environment: {},
    });
    appointments.addMethod("GET", new LambdaIntegration(getAppointmentList));

    const postFunctionName = "createAppointment";
    const createAppointment = new NodejsFunction(this, postFunctionName, {
      functionName: postFunctionName,
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(
        __dirname,
        `/../resources/challenge/${postFunctionName}.ts`,
      ),
      handler: "mainHandler",
      environment: {},
    });
    appointments.addMethod("POST", new LambdaIntegration(createAppointment));

    const healthSystemTable = new TableV2(this, "HealthSystemTable", {
      tableName: "HealthSystemTable",
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
    });

    const insertBasicEntitiesFunctionName = "insertBasicEntities";
    const inserBasicEntities = new NodejsFunction(
      this,
      insertBasicEntitiesFunctionName,
      {
        functionName: insertBasicEntitiesFunctionName,
        runtime: Runtime.NODEJS_20_X,
        handler: "mainHandler",
        entry: path.join(
          __dirname,
          `/../resources/challenge/${insertBasicEntitiesFunctionName}.ts`,
        ),
        environment: {
          HEALTH_SYSTEM_TABLE: "HealthSystemTable",
        },
      },
    );

    healthSystemTable.grantWriteData(inserBasicEntities);

    const functionURL = inserBasicEntities.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });
    new cdk.CfnOutput(this, "functionURL", { value: functionURL.url });
  }
}
