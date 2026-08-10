import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { findProjectRoot } from '../lib/paths.js'
import {
  applyVerifySync,
  harvestSignals,
  loadHarnessConfig,
  proposePatches
} from '../lib/harvest.js'

export function runHarvest() {
  const root = findProjectRoot()
  if (!root) {
    console.error('Not in a harness project')
    process.exit(1)
  }

  const signals = harvestSignals(root)
  const outDir = path.join(root, '.harness')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'harvest.json'),
    JSON.stringify(signals, null, 2) + '\n'
  )

  console.log(`Harvested ${signals.length} signal(s)`)
  for (const s of signals) {
    console.log(`  [${s.type}] ${s.message}`)
  }
}

export function runPropose() {
  const root = findProjectRoot()
  if (!root) {
    console.error('Not in a harness project')
    process.exit(1)
  }

  const harvestPath = path.join(root, '.harness', 'harvest.json')
  const signals = fs.existsSync(harvestPath)
    ? JSON.parse(fs.readFileSync(harvestPath, 'utf8'))
    : harvestSignals(root)

  const config = loadHarnessConfig(root).evolution ?? {}
  const proposals = proposePatches(root, signals, config)

  fs.mkdirSync(path.join(root, '.harness'), { recursive: true })
  fs.writeFileSync(
    path.join(root, '.harness', 'proposals.json'),
    JSON.stringify(proposals, null, 2) + '\n'
  )

  console.log(`${proposals.length} proposal(s)`)
  for (const p of proposals) {
    console.log(`\n[${p.signal.type}] → ${p.artifact} (auto: ${p.auto})`)
    console.log(`  ${p.rationale}`)
    console.log(`  ${p.diff}`)
  }
}

export async function runApply(options: { interactive?: boolean; auto?: boolean }) {
  const root = findProjectRoot()
  if (!root) {
    console.error('Not in a harness project')
    process.exit(1)
  }

  const propPath = path.join(root, '.harness', 'proposals.json')
  if (!fs.existsSync(propPath)) {
    console.error('Run harness propose first')
    process.exit(1)
  }

  const proposals = JSON.parse(fs.readFileSync(propPath, 'utf8'))
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  const ask = (q: string) =>
    new Promise<string>((resolve) => rl.question(q, resolve))

  for (const p of proposals) {
    const shouldAuto = options.auto && p.auto
    let apply = shouldAuto

    if (options.interactive && !shouldAuto) {
      const answer = await ask(`Apply ${p.signal.type} to ${p.artifact}? [y/N] `)
      apply = answer.toLowerCase() === 'y'
    }

    if (!apply && !options.auto && !options.interactive) continue

    if (p.signal.type === 'verify-sync' && apply) {
      const cmd = p.diff.replace(/^\+ /, '')
      applyVerifySync(root, cmd)
      console.log(`Applied verify-sync: ${cmd}`)
    } else if (apply && p.signal.type === 'glossary-drift') {
      const glossaryPath = path.join(root, 'docs/harness/glossary.md')
      if (fs.existsSync(glossaryPath)) {
        fs.appendFileSync(glossaryPath, '\n' + p.diff + '\n')
        console.log('Appended glossary row (edit definition)')
      }
    }
  }

  rl.close()
}
