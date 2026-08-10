import fs from 'node:fs'
import path from 'node:path'

export function copyRecursive(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src)) {
      if (entry === 'node_modules' || entry === '.git') continue
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
    return
  }
  fs.copyFileSync(src, dest)
}

export function finalizeHarnessLayout(targetDir: string) {
  const controlsDir = path.join(targetDir, 'harness', 'controls')
  const harnessDir = path.join(targetDir, 'harness')

  if (fs.existsSync(controlsDir)) {
    for (const entry of fs.readdirSync(controlsDir)) {
      const from = path.join(controlsDir, entry)
      const to = path.join(harnessDir, entry)
      if (fs.existsSync(to)) {
        if (fs.statSync(from).isDirectory()) {
          copyRecursive(from, to)
        }
      } else {
        copyRecursive(from, to)
      }
    }
    fs.rmSync(controlsDir, { recursive: true, force: true })
  }

  const nestedControls = path.join(targetDir, 'docs', 'harness', 'controls')
  if (fs.existsSync(nestedControls)) {
    fs.rmSync(nestedControls, { recursive: true, force: true })
  }
}

export function writeDefaultConfig(targetDir: string) {
  const configPath = path.join(targetDir, 'harness.config.json')
  if (fs.existsSync(configPath)) return
  const schema = {
    evolution: {
      auto: ['verify-sync', 'agents-dead-link'],
      propose: ['glossary-drift', 'repeated-failure'],
      never: ['context-scope', 'new-invariant-without-test']
    }
  }
  fs.writeFileSync(configPath, JSON.stringify(schema, null, 2) + '\n')
}
