import { execSync } from "child_process";
import { ArgumentParser } from "argparse";

const parser = new ArgumentParser({
  description: "Manage the playground environment",
});

parser.add_argument("--action", {
  type: String,
  required: true,
  choices: ["deploy", "destroy"],
});
parser.add_argument("--branch-name", { type: String, required: true });
parser.add_argument("--id", { type: String, required: true });

const args = parser.parse_args();

const stackName = `aws-playground-${args.id}`;

if (args.action === "deploy") {
  console.log("Deploying playground environment");

  execSync(
    `npx cdk -c stackName=${stackName} -c branchName=${args.branch_name} -c playgroundIdentity=${args.id} deploy --require-approval=never ${stackName}`,
    { stdio: "inherit" }
  );
}

if (args.action === "destroy") {
  console.log("Destroying playground environment");

  execSync(
    `npx cdk -c stackName=${stackName} -c branchName=${args.branch_name} -c playgroundIdentity=${args.id} destroy --force --require-approval=never ${stackName}`,
    { stdio: "inherit" }
  );
}
