import { findProjectRoot } from '../lib/paths.js'
import { runDoctor } from '../lib/doctor.js'
import { readVerifyCommands } from '../lib/verify-slice.js'

export function runDoctorCmd(cwd?: string): number {
  const root = findProjectRoot(cwd ?? process.cwd())
  if (!root) {
    console.error('Not in a harness project')
    return 1
  }

  let verifyHasCommands = false
  try {
    verifyHasCommands = readVerifyCommands(root).length > 0
  } catch {
    verifyHasCommands = false
  }

  const result = runDoctor(root, verifyHasCommands)
  console.log(`Harness maturity: ${result.level}/4\n`)

  for (const check of result.checks) {
    const mark = check.ok ? '✓' : '✗'
    console.log(`${mark} ${check.message}`)
  }

  const failed = result.checks.filter((c) => !c.ok)
  if (failed.length > 0) {
    console.log('\nPróximo passo:', failed[0].message)
  }

  return result.level >= 3 ? 0 : 1
}
