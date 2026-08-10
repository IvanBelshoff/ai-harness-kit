#!/usr/bin/env node
import { Command } from 'commander'
import { runInit, runInitIntoExisting } from './commands/init.js'
import { runVerify } from './commands/verify.js'
import { runDoctorCmd } from './commands/doctor.js'
import { runListTemplates } from './commands/list-templates.js'
import { runMirror } from './commands/mirror.js'
import { runHarvest, runPropose, runApply } from './commands/harvest.js'

const program = new Command()

program
  .name('harness')
  .description('AI Harness Kit CLI')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize harness from template')
  .option('-t, --template <id>', 'template preset id')
  .option('--stack <stack>', 'stack id for composition')
  .option('--domain <domain>', 'domain overlay id')
  .argument('[dir]', 'target directory', '.')
  .action((dir, opts) => {
    try {
      if (dir === '.' && opts.template === 'harness-only') {
        runInitIntoExisting(process.cwd(), 'harness-only')
      } else {
        runInit({
          template: opts.template,
          stack: opts.stack,
          domain: opts.domain,
          target: dir
        })
      }
    } catch (err) {
      console.error(err instanceof Error ? err.message : err)
      process.exit(1)
    }
  })

program
  .command('list-templates')
  .description('List available templates')
  .option('--stack <stack>', 'filter by stack tag')
  .option('--domain <domain>', 'filter by domain')
  .option('--status <status>', 'filter by status')
  .action((opts) => runListTemplates(opts))

program
  .command('verify')
  .description('Run verify-slice commands')
  .action(() => {
    const ok = runVerify()
    process.exit(ok ? 0 : 1)
  })

program
  .command('doctor')
  .description('Check harness maturity')
  .action(() => {
    process.exit(runDoctorCmd())
  })

program
  .command('mirror')
  .description('Mirror verify-slice to Cursor hooks and/or GitHub Actions')
  .option('--cursor', 'write .cursor/hooks.json')
  .option('--github-actions', 'write .github/workflows/verify-slice.yml')
  .action((opts) => runMirror(opts))

program.command('harvest').description('Collect harness evolution signals').action(runHarvest)

program.command('propose').description('Propose harness patches from signals').action(runPropose)

program
  .command('apply')
  .description('Apply proposed patches')
  .option('-i, --interactive', 'confirm each patch')
  .option('--auto', 'apply auto-whitelisted patches only')
  .action(async (opts) => {
    await runApply(opts)
  })

program.parse()
