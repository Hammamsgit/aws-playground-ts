import { StackProps } from "aws-cdk-lib";

export interface PlaygroundStackProps extends StackProps {
  buildName: (name: string) => string;
  playgroundIdentity: string;
}
