#!/usr/bin/env node
/**
 * Local E2E for ai-harness-kit (pre-npm publish).
 * Usage: node scripts/e2e-local.mjs
 * Env: E2E_ROOT (default ~/harness-e2e), KIT_ROOT (auto-detected)
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KIT_ROOT = process.env.KIT_ROOT ?? path.resolve(__dirname, '..')
const E2E_ROOT = process.env.E2E_ROOT ?? path.join(os.homedir(), 'harness-e2e')
const HARNESS_BIN = path.join(KIT_ROOT, 'packages/cli/dist/index.js')
const CREATE_BIN = path.join(KIT_ROOT, 'packages/cli/dist/create-harness.js')
const MCP = path.join(KIT_ROOT, 'packages/mcp/dist/index.js')

const results = []

function sh(args, opts = {}) {
  const cwd = opts.cwd ?? KIT_ROOT
  const [bin, ...rest] = args
  const r = spawnSync(bin, rest, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...opts.env }
  })
  return { code: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
}

function harness(args, opts = {}) {
  return sh(['node', HARNESS_BIN, ...args], opts)
}

function createHarness(args, opts = {}) {
  return sh(['node', CREATE_BIN, ...args], opts)
}

function run(name, fn) {
  process.stdout.write(`\n=== ${name} ===\n`)
  try {
    const detail = fn()
    results.push({ name, pass: true, detail })
    console.log('PASS', name)
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push({ name, pass: false, error: msg })
    console.error('FAIL', name, msg)
    return false
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function rmDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

function copyFilter(src, dest, exclude = []) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src)) {
    if (exclude.includes(entry)) continue
    const s = path.join(src, entry)
    const d = path.join(dest, entry)
    if (fs.statSync(s).isDirectory()) copyFilter(s, d, exclude)
    else fs.copyFileSync(s, d)
  }
}

fs.mkdirSync(E2E_ROOT, { recursive: true })

run('list-templates', () => {
  const r = harness(['list-templates'])
  assert(r.code === 0, r.stderr)
  assert(r.stdout.includes('node-api'), 'missing node-api')
  const react = harness(['list-templates', '--stack', 'react'])
  assert(react.stdout.includes('vite-react-tailwind'), 'react filter')
})

const scaffoldTemplates = [
  { dir: '01-node-api', template: 'node-api' },
  { dir: '02-vite-spa', template: 'vite-react-tailwind' },
  { dir: '03-vite-analitico', template: 'vite-react-tailwind-analitico' },
  { dir: '04-vite-design-system', template: 'vite-react-tailwind-design-system' }
]

for (const { dir, template } of scaffoldTemplates) {
  run(`scaffold:${dir}`, () => {
    const target = path.join(E2E_ROOT, dir)
    rmDir(target)
    const c = createHarness([target, '--template', template])
    assert(c.code === 0, c.stderr || c.stdout)
    const i = sh(['npm', 'install'], { cwd: target })
    assert(i.code === 0, i.stderr)
    const doctor = harness(['doctor'], { cwd: target })
    assert(doctor.code === 0, `doctor failed: ${doctor.stdout}${doctor.stderr}`)
    const verify = harness(['verify'], { cwd: target })
    assert(verify.code === 0, `verify failed: ${verify.stdout}${verify.stderr}`)
  })
}

run('brownfield:05-harness-only-empty', () => {
  const target = path.join(E2E_ROOT, '05-harness-only-empty')
  rmDir(target)
  fs.mkdirSync(target, { recursive: true })
  const r = harness(['init', '--template', 'harness-only'], { cwd: target })
  assert(r.code === 0, r.stderr)
  assert(fs.existsSync(path.join(target, 'AGENTS.md')), 'AGENTS.md')
  assert(fs.existsSync(path.join(target, 'harness.config.json')), 'config')
})

run('brownfield:06-brownfield-legacy', () => {
  const target = path.join(E2E_ROOT, '06-brownfield-legacy')
  rmDir(target)
  const srcApi = path.join(E2E_ROOT, '01-node-api')
  copyFilter(srcApi, target, [
    'harness',
    'docs',
    'AGENTS.md',
    'harness.config.json',
    'node_modules',
    '.harness'
  ])
  const r = harness(['init', '--template', 'harness-only'], { cwd: target })
  assert(r.code === 0, r.stderr)
  assert(fs.existsSync(path.join(target, 'src/tasks.ts')), 'legacy src preserved')
  assert(fs.existsSync(path.join(target, 'AGENTS.md')), 'AGENTS.md added')
})

run('mirror:07-mirror-hooks', () => {
  const target = path.join(E2E_ROOT, '07-mirror-hooks')
  rmDir(target)
  copyFilter(path.join(E2E_ROOT, '03-vite-analitico'), target, ['node_modules', '.harness'])
  const m = harness(['mirror', '--cursor', '--github-actions'], { cwd: target })
  assert(m.code === 0, m.stderr)
  const hooks = path.join(target, '.cursor/hooks.json')
  const workflow = path.join(target, '.github/workflows/verify-slice.yml')
  assert(fs.existsSync(hooks), 'hooks.json')
  assert(fs.existsSync(workflow), 'workflow')
  const verifyMd = fs.readFileSync(
    path.join(target, 'harness/triggers/verify-slice.md'),
    'utf8'
  )
  const workflowYaml = fs.readFileSync(workflow, 'utf8')
  assert(workflowYaml.includes('npm run typecheck'), 'workflow typecheck')
  assert(verifyMd.includes('typecheck'), 'verify-slice typecheck')
})

run('harvest:08-harvest-evolution', () => {
  const target = path.join(E2E_ROOT, '08-harvest-evolution')
  rmDir(target)
  copyFilter(path.join(E2E_ROOT, '01-node-api'), target, ['node_modules', '.harness'])
  fs.appendFileSync(
    path.join(target, 'src/tasks.ts'),
    '\nexport function TodoItem() { return "drift" }\n'
  )
  const h = harness(['harvest'], { cwd: target })
  assert(h.code === 0, h.stderr)
  assert(fs.existsSync(path.join(target, '.harness/harvest.json')), 'harvest.json')
  const p = harness(['propose'], { cwd: target })
  assert(p.code === 0, p.stderr)
  assert(fs.existsSync(path.join(target, '.harness/proposals.json')), 'proposals.json')
  const proposals = JSON.parse(
    fs.readFileSync(path.join(target, '.harness/proposals.json'), 'utf8')
  )
  assert(proposals.length > 0, 'expected proposals')
})

run('verify-loop:09-verify-failure-loop', () => {
  const target = path.join(E2E_ROOT, '09-verify-failure-loop')
  rmDir(target)
  copyFilter(path.join(E2E_ROOT, '01-node-api'), target, ['node_modules', '.harness'])
  sh(['npm', 'install'], { cwd: target })
  const tasksPath = path.join(target, 'src/tasks.ts')
  let content = fs.readFileSync(tasksPath, 'utf8')
  content = content.replace(
    'if (duplicate) {\n    throw new Error(\'TITLE_NOT_UNIQUE\')\n  }',
    'if (duplicate) { /* broken */ }'
  )
  fs.writeFileSync(tasksPath, content)
  const fail = harness(['verify'], { cwd: target })
  assert(fail.code !== 0, 'verify should fail')
  assert(fs.existsSync(path.join(target, '.harness/verify.log')), 'verify.log')
  content = fs.readFileSync(tasksPath, 'utf8')
  content = content.replace(
    'if (duplicate) { /* broken */ }',
    'if (duplicate) {\n    throw new Error(\'TITLE_NOT_UNIQUE\')\n  }'
  )
  fs.writeFileSync(tasksPath, content)
  const pass = harness(['verify'], { cwd: target })
  assert(pass.code === 0, 'verify should pass after fix')
})

run('npm-pack:10-npm-pack-smoke', () => {
  const cliPkg = path.join(KIT_ROOT, 'packages/cli')
  sh(['npm', 'pack'], { cwd: cliPkg })
  const tgz = path.join(cliPkg, 'ai-harness-cli-0.1.0.tgz')
  assert(fs.existsSync(tgz), 'tarball missing')
  const target = path.join(E2E_ROOT, '10-npm-pack-smoke')
  rmDir(target)
  fs.mkdirSync(target, { recursive: true })
  sh(['npm', 'init', '-y'], { cwd: target })
  const i = sh(['npm', 'install', tgz], { cwd: target })
  assert(i.code === 0, i.stderr)
  const list = sh(['npx', 'harness', 'list-templates'], { cwd: target })
  assert(list.code === 0 && list.stdout.includes('node-api'), 'list from pack')
  const init = sh(['npx', 'harness', 'init', '--template', 'harness-only', '.'], {
    cwd: target
  })
  assert(init.code === 0, init.stderr)
  const packScaffold = path.join(E2E_ROOT, '10-node-api-pack')
  rmDir(packScaffold)
  const create = sh(
    ['npx', 'create-harness', packScaffold, '--template', 'node-api'],
    { cwd: target }
  )
  assert(create.code === 0, create.stderr || create.stdout)
})

run('mcp:smoke', () => {
  const repo = path.join(E2E_ROOT, '01-node-api')
  const harnessCli = path.join(KIT_ROOT, 'packages/cli/dist/index.js')
  // Direct file reads like MCP does
  const ctx = fs.readFileSync(path.join(repo, 'docs/harness/context.md'), 'utf8')
  assert(ctx.includes('Tasks'), 'context readable')
  const proc = fs.readFileSync(
    path.join(repo, 'harness/procedures/add-endpoint.md'),
    'utf8'
  )
  assert(proc.includes('endpoint'), 'procedure readable')
  const verify = sh(['node', harnessCli, 'verify'], {
    cwd: repo,
    env: { HARNESS_ROOT: repo }
  })
  assert(verify.code === 0, 'verify via cli path for MCP parity')
})

const readme = [
  '# Harness E2E Results',
  '',
  `Date: ${new Date().toISOString()}`,
  `KIT_ROOT: ${KIT_ROOT}`,
  `E2E_ROOT: ${E2E_ROOT}`,
  '',
  '| Test | Pass |',
  '|------|------|',
  ...results.map((r) => `| ${r.name} | ${r.pass ? 'yes' : 'NO'} |`),
  '',
  `Summary: ${results.filter((r) => r.pass).length}/${results.length} passed`,
  ''
].join('\n')

fs.writeFileSync(path.join(E2E_ROOT, 'README-results.md'), readme)
fs.writeFileSync(
  path.join(E2E_ROOT, 'results.json'),
  JSON.stringify({ results, summary: readme.split('\n').pop() }, null, 2) + '\n'
)

const failed = results.filter((r) => !r.pass)
if (failed.length > 0) {
  console.error(`\nE2E FAILED: ${failed.length} test(s)`)
  process.exit(1)
}
console.log(`\nE2E OK: ${results.length} tests at ${E2E_ROOT}`)
