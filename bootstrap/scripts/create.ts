import prompts from "prompts";
import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";

const toKebabCase = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

const boostrapPath = path.join(__dirname, "../project");

const run = async () => {
  const projectName = await prompts({
    type: "text",
    name: "name",
    message: "what is the name of your project?",
  });

  const kebabCaseProjectName = toKebabCase(projectName.name);
  const newProjectPath = path.join(
    __dirname,
    "../../playground",
    kebabCaseProjectName
  );

  await fs.copy(boostrapPath, newProjectPath);

  await execSync(`git checkout -b pg/${kebabCaseProjectName}`);
};

run();
