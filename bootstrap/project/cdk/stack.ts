import * as cdk from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import path from 'path'
import { PlaygroundStackProps } from 'bootstrap/types'
import { Effect, OpenIdConnectPrincipal, OpenIdConnectProvider, PolicyDocument, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam'

export class PlaygroundStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PlaygroundStackProps) {
    super(scope, id, props)

    const { buildName } = props

    const provider = new OpenIdConnectProvider(this, "MyProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
    })

    const GitHubPrincipal = new OpenIdConnectPrincipal(provider).withConditions({
      StringLike: {
        "token.actions.githubusercontent.com:sub": `repo:hammamsgit/aws-playground-ts:*`,
      },
    })

    new Role(this, "GitHubActionsRole", {
      assumedBy: GitHubPrincipal,
      description:
        "Role assumed by GitHubPrincipal for deploying from CI using aws cdk",
      roleName: "github-ci-role",
      maxSessionDuration: cdk.Duration.hours(1),
      inlinePolicies: {
        CdkDeploymentPolicy: new PolicyDocument({
          assignSids: true,
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["sts:AssumeRole"],
              resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
            }),
          ],
        }),
      },
    })


    new NodejsFunction(this, 'HelloWorld', {
      functionName: buildName('testing-lambda'),
      entry: path.join(__dirname, '../src/hello-world.ts'),
    })
  }
}
