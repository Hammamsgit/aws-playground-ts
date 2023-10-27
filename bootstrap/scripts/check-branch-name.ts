import { execSync } from "child_process"
import fs from "fs-extra"
import path from "path"
import chalk from "chalk"

const BRANCH_REGEX = /pg\/\w+\/\w+(\/.*)?/g

const run = async () => {
  const branchName = execSync("git rev-parse --abbrev-ref HEAD").toString().trim()
  if (!branchName.startsWith("pg")) {
    console.log(chalk.green("Branch name is valid!"))
    process.exit(0)
  }

  const validBranch = BRANCH_REGEX.test(branchName)

  if (!validBranch) {
    console.error(chalk.red(`Branch name ${chalk.yellow(branchName)} is not valid. should follow the pattern ${chalk.blue("pg/<project>")}`))
    process.exit(1)
  }

  const [, project] = branchName.split("/")

  const projects = fs.readdirSync(path.join(__dirname, "../../playground"))

  if (!projects.includes(project)) {
    console.error(chalk.red(`Project '${chalk.yellow(project)}' does not exist within the playground directory.`))
    process.exit(1)
  }

  console.log(chalk.green("Branch name is valid!"))
  process.exit(0)
}

run()
