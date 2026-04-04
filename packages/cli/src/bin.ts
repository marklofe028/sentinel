#!/usr/bin/env node
import { Command } from 'commander'
import { auditCommand } from './commands/audit.js'
import { initCommand }  from './commands/init.js'

const program = new Command()

program
  .name('assay')
  .description('Assay — the senior engineer watching every line you ship')
  .version('0.1.0')

program.addCommand(auditCommand)
program.addCommand(initCommand)

program.parse()
