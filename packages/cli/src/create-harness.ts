#!/usr/bin/env node
import { Command } from 'commander'
import { runInit } from './commands/init.js'

const program = new Command()

program
  .name('create-harness')
  .description('Create a new project with AI Harness template')
  .argument('<dir>', 'project directory')
  .option('-t, --template <id>', 'template preset id', 'vite-react-tailwind')
  .option('--stack <stack>', 'stack id')
  .option('--domain <domain>', 'domain overlay')
  .action((dir, opts) => {
    try {
      runInit({
        template: opts.template,
        stack: opts.stack,
        domain: opts.domain,
        target: dir
      })
    } catch (err) {
      console.error(err instanceof Error ? err.message : err)
      process.exit(1)
    }
  })

program.parse()
