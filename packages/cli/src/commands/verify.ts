import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { findProjectRoot } from '../lib/paths.js'
import { readVerifyCommands } from '../lib/verify-slice.js'

export function runVerify(cwd?: string): boolean {
  const root = findProjectRoot(cwd ?? process.cwd())
  if (!root) {
    console.error('Not in a harness project (no harness/ or harness.config.json)')
    return false
  }

  const commands = readVerifyCommands(root)
  if (commands.length === 0) {
    console.error('No commands found in verify-slice.md')
    return false
  }

  const logDir = path.join(root, '.harness')
  fs.mkdirSync(logDir, { recursive: true })
  const logPath = path.join(logDir, 'verify.log')

  console.log('Running harness/triggers/verify-slice.md')
  let allOk = true

  for (const cmd of commands) {
    process.stdout.write(`  ${cmd} ... `)
    try {
      execSync(cmd, { cwd: root, stdio: 'pipe', encoding: 'utf8' })
      console.log('ok')
    } catch (err: unknown) {
      allOk = false
      const msg =
        err && typeof err === 'object' && 'stderr' in err
          ? String((err as { stderr?: Buffer }).stderr ?? err)
          : String(err)
      console.log('FAIL')
      fs.appendFileSync(logPath, msg.slice(0, 200) + '\n')
    }
  }

  if (allOk) {
    console.log('Slice ready (verify green)')
  } else {
    console.error('Verify failed. See .harness/verify.log')
  }

  return allOk
}
