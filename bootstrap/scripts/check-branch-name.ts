import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

const BRANCH_REGEX = /pg\/\w+\/\w+(\/.*)?/g

const run = async () => {
  const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  if (!branchName.startsWith('pg')) {
    console.log(chalk.green('Branch name is valid!'))
    process.exit(0)
  }

  const services = fs.readdirSync(path.join(__dirname, '../../playground'))
  const validBranch = BRANCH_REGEX.test(branchName)

  if (!validBranch) {
    console.error(
      chalk.red(
        `Branch name ${chalk.yellow(branchName)} is not valid. should follow the pattern ${chalk.blue(
          'pg/<service>/<project>',
        )}`,
      ),
    )
    process.exit(1)
  }

  const [, service, project] = branchName.split('/')

  if (!services.includes(service)) {
    console.error(chalk.red(`Service '${chalk.yellow(service)}' is not a valid service.`))
    console.error(chalk.red(`Valid services are: ${chalk.blue(services.join(', '))}`))
    process.exit(1)
  }

  const projects = fs.readdirSync(path.join(__dirname, '../../playground', service))

  if (!projects.includes(project)) {
    console.error(
      chalk.red(
        `Project '${chalk.yellow(project)}' does not exist within the '${chalk.yellow(service)}' service directory.`,
      ),
    )
    console.error(chalk.red(`should be one of: ${chalk.blue(projects.join(', '))}`))
    process.exit(1)
  }

  console.log(chalk.green('Branch name is valid!'))
  process.exit(0)
}

run()
