import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function getKitRoot(): string {
  const candidates = [
    path.resolve(__dirname, '../../..'),
    path.resolve(__dirname, '../..'),
    path.join(process.cwd(), 'templates')
  ]
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'templates', 'registry.json'))) {
      return dir
    }
    if (fs.existsSync(path.join(dir, 'registry.json')) && dir.endsWith('templates')) {
      return path.dirname(dir)
    }
  }
  throw new Error('Could not locate ai-harness-kit templates directory')
}

export function getTemplatesDir(): string {
  const kitRoot = getKitRoot()
  const fromRoot = path.join(kitRoot, 'templates')
  if (fs.existsSync(path.join(fromRoot, 'registry.json'))) return fromRoot
  const fromPkg = path.join(kitRoot, 'packages', 'cli', 'templates')
  if (fs.existsSync(path.join(fromPkg, 'registry.json'))) return fromPkg
  throw new Error('templates/registry.json not found')
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
