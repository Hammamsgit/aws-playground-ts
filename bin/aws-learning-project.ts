import path from "path";
import * as cdk from "aws-cdk-lib";
import * as bootstrap from "../bootstrap/project/cdk/stack";

const app = new cdk.App();

const branchName =
  app.node.tryGetContext("branchName") || process.env.BRANCH_NAME;
const stackName = app.node.tryGetContext("stackName") || process.env.STACK_NAME;
const playgroundIdentity =
  app.node.tryGetContext("playgroundIdentity") ||
  process.env.PLAYGROUND_IDENTITY;

if (!branchName) {
  console.error(
    'The "branchName" context value is not defined. Please set it in your CDK context.'
  );
  process.exit(1); // Exit the script if branchName is not defined
}

console.log(
  `Deploying stack "${stackName}" for playground "${playgroundIdentity}"`
);

const playgroundPath = branchName.split("/").splice(1, 2).join("/");
const stackPath = path.join(
  __dirname,
  "../playground",
  playgroundPath,
  "cdk",
  "stack.ts"
);

const { PlaygroundStack } = require(stackPath) as {
  PlaygroundStack: typeof bootstrap.PlaygroundStack;
};

new PlaygroundStack(app, stackName, {
  stackName: stackName,
  buildName: (name: string) => `${name}-${playgroundIdentity}`,
  playgroundIdentity,
});
