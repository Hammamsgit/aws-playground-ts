import path from 'path'
import * as cdk from 'aws-cdk-lib'
import * as bootstrap from '../bootstrap/project/cdk/stack'

const app = new cdk.App()

const branchName = app.node.tryGetContext('branchName') || process.env.BRANCH_NAME
const stackName = app.node.tryGetContext('stackName') || process.env.STACK_NAME
const playgroundIdentity = app.node.tryGetContext('playgroundIdentity')  || process.env.PLAYGROUND_IDENTITY

const playgroundPath = branchName.split('/').splice(1, 2).join('/')
const stackPath = path.join(__dirname, '../playground', playgroundPath, 'cdk', 'stack.ts')

const { PlaygroundStack } = require(stackPath) as { PlaygroundStack: typeof bootstrap.PlaygroundStack }

new PlaygroundStack(app, stackName, {
  stackName: stackName,
  buildName: (name: string) => `${name}-${playgroundIdentity}`,
  playgroundIdentity,
})
