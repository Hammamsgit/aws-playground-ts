import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";
import { PlaygroundStackProps } from "bootstrap/types";
import {
  Effect,
  OpenIdConnectPrincipal,
  OpenIdConnectProvider,
  PolicyDocument,
  PolicyStatement,
  Role,
} from "aws-cdk-lib/aws-iam";

export class PlaygroundStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PlaygroundStackProps) {
    super(scope, id, props);

    const { buildName } = props;

    new NodejsFunction(this, "HelloWorld", {
      functionName: buildName("testing-lambda"),
      entry: path.join(__dirname, "../src/hello-world.ts"),
    });
  }
}
