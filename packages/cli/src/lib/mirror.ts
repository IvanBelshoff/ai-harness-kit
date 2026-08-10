import fs from 'node:fs'
import path from 'node:path'

export function mirrorCursor(projectRoot: string, commands: string[]) {
  const cursorDir = path.join(projectRoot, '.cursor')
  fs.mkdirSync(cursorDir, { recursive: true })

  const subset = commands.slice(0, 2).join(' && ')
  const hooks = {
    version: 1,
    hooks: {
      afterFileEdit: subset ? [{ command: subset }] : []
    }
  }
  fs.writeFileSync(
    path.join(cursorDir, 'hooks.json'),
    JSON.stringify(hooks, null, 2) + '\n'
  )

  const rulesDir = path.join(cursorDir, 'rules')
  fs.mkdirSync(rulesDir, { recursive: true })
  const rule = `---
description: AI Harness index
globs: *
---

Leia AGENTS.md antes de codar. Contexto em docs/harness/. Procedimentos em harness/procedures/. Verificar com harness verify.
`
  fs.writeFileSync(path.join(rulesDir, 'harness.mdc'), rule)
}

export function mirrorGitHubActions(projectRoot: string, commands: string[]) {
  const workflowDir = path.join(projectRoot, '.github', 'workflows')
  fs.mkdirSync(workflowDir, { recursive: true })

  const steps = commands
    .map((cmd) => {
      if (cmd.startsWith('npm run ')) {
        return `      - run: ${cmd}`
      }
      return `      - run: ${cmd}`
    })
    .join('\n')

  const yaml = `name: verify-slice

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
${steps}

# Alinhado a harness/triggers/verify-slice.md (harness mirror --github-actions)
`
  fs.writeFileSync(path.join(workflowDir, 'verify-slice.yml'), yaml)
}
