import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { runAudit } from '@assay-dev/core'
import { readProjectFiles, readGitignore, readPackageJson } from '../utils/fs.js'

export const auditCommand = new Command('audit')
  .description('Run Assay audit on a project directory')
  .argument('[path]', 'path to project', '.')
  .option('-t, --threshold <number>', 'minimum passing score', '70')
  .action(async (targetPath: string, opts: { threshold: string }) => {
    const threshold = parseInt(opts.threshold, 10)
    const spinner = ora('Assay scanning...').start()

    try {
      const [files, gitignore, packageJson] = await Promise.all([
        readProjectFiles(targetPath),
        readGitignore(targetPath),
        readPackageJson(targetPath),
      ])

      const fileCount = Object.keys(files).length
      spinner.text = `Scanning ${fileCount} files...`

      const result = await runAudit({ files, env: {}, gitignore, packageJson })

      spinner.stop()

      // header
      console.log('\n' + chalk.bold('ASSAY AUDIT REPORT'))
      console.log(chalk.dim('─'.repeat(40)))

      // score
      const scoreColor =
        result.score >= threshold ? chalk.green :
        result.score >= 50       ? chalk.yellow :
                                   chalk.red
      console.log(`Score:    ${scoreColor.bold(result.score + ' / 100')}`)
      console.log(`Files:    ${fileCount}`)
      console.log(`Issues:   ${result.issues.length}`)
      console.log(`Status:   ${result.score >= threshold
        ? chalk.green('[ASSAY:OK] Clear to deploy')
        : chalk.red('[ASSAY:BLOCK] Below threshold — review issues first')}`)
      console.log(chalk.dim('─'.repeat(40)))

      if (result.issues.length === 0) {
        console.log(chalk.green('\n✓ No issues found. Suit is clean.\n'))
        return
      }

      // group by tier
      const tier3 = result.issues.filter(i => i.tier === 3)
      const tier2 = result.issues.filter(i => i.tier === 2)
      const tier1 = result.issues.filter(i => i.tier === 1)

      if (tier3.length > 0) {
        console.log(chalk.red.bold(`\n[BLOCK] Hard blocks (${tier3.length})`))
        for (const issue of tier3) {
          console.log(chalk.red(`  ✕ ${issue.title}`))
          console.log(chalk.dim(`    ${issue.detail}`))
          if (issue.fix) console.log(chalk.dim(`    Fix: ${issue.fix}`))
        }
      }

      if (tier2.length > 0) {
        console.log(chalk.yellow.bold(`\n[WARN] Friction gates (${tier2.length})`))
        for (const issue of tier2) {
          console.log(chalk.yellow(`  ⚠ ${issue.title}`))
          console.log(chalk.dim(`    ${issue.detail}`))
          if (issue.fix) console.log(chalk.dim(`    Fix: ${issue.fix}`))
        }
      }

      if (tier1.length > 0) {
        console.log(chalk.gray.bold(`\n[ADVISORY] Advisories (${tier1.length})`))
        for (const issue of tier1) {
          console.log(chalk.gray(`  · ${issue.title}`))
          console.log(chalk.dim(`    ${issue.detail}`))
          if (issue.fix) console.log(chalk.dim(`    Fix: ${issue.fix}`))
        }
      }

      console.log('')

    } catch (err) {
      spinner.stop()
      console.error(chalk.red('Assay encountered an error:'), err)
      process.exit(1)
    }
  })
