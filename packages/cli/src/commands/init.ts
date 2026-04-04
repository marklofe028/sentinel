import { Command } from 'commander'
import chalk from 'chalk'

export const initCommand = new Command('init')
  .description('Scaffold a new project using Sentinel Vault templates')
  .argument('[domain]', 'project domain: saas | api | mobile | ecommerce | internal')
  .action((domain: string) => {
    console.log(chalk.bold('\nSentinel Vault'))
    console.log(chalk.dim('─'.repeat(40)))
    if (!domain) {
      console.log('Usage: sentinel init <domain>')
      console.log('Domains: saas | api | mobile | ecommerce | internal')
    } else {
      console.log(chalk.yellow(`⚡ Vault template for "${domain}" coming soon.`))
      console.log(chalk.dim('  Bootstrap templates are next on the build list.'))
    }
    console.log('')
  })
