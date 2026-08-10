import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function getTemplatesDir(): string {
  const candidates = [
    path.join(__dirname, '..', 'templates'),
    path.join(__dirname, '../../templates'),
    path.join(process.cwd(), 'templates')
  ]

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'registry.json'))) return dir
  }

  const kitRoot = path.resolve(__dirname, '../../..')
  const monorepoTpl = path.join(kitRoot, 'templates')
  if (fs.existsSync(path.join(monorepoTpl, 'registry.json'))) return monorepoTpl

  throw new Error('Could not locate ai-harness-kit templates directory')
}

export function getKitRoot(): string {
  return path.dirname(getTemplatesDir())
}

export function findProjectRoot(start = process.cwd()): string | null {
  let dir = path.resolve(start)
  while (true) {
    if (
      fs.existsSync(path.join(dir, 'harness')) ||
      fs.existsSync(path.join(dir, 'harness.config.json'))
    ) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

export function resolveTargetDir(target?: string): string {
  return path.resolve(target ?? process.cwd())
}
