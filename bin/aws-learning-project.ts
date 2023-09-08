import path from 'path'
import * as cdk from 'aws-cdk-lib'
import * as bootstrap from '../bootstrap/project/cdk/stack'

const app = new cdk.App()

const branchName = app.node.tryGetContext('branchName')
const stackName = app.node.tryGetContext('stackName')
const playgroundIdentity = app.node.tryGetContext('playgroundIdentity')

const playgroundPath = branchName.split('/').splice(1, 2).join('/')
const stackPath = path.join(__dirname, '../playground', playgroundPath, 'cdk', 'stack.ts')

const { PlaygroundStack } = require(stackPath) as { PlaygroundStack: typeof bootstrap.PlaygroundStack }

new PlaygroundStack(app, stackName, {
  stackName: stackName,
  buildName: (name: string) => `${name}-${playgroundIdentity}`,
  playgroundIdentity,
})
