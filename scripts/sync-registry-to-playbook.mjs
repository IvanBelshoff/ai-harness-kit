import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const registry = path.join(__dirname, '..', 'templates', 'registry.json')
const targets = [
  path.join(__dirname, '..', '..', 'ai-harness-playbook', 'docs', 'kit', 'registry.json')
]

for (const t of targets) {
  if (path.dirname(t).endsWith('kit')) {
    fs.mkdirSync(path.dirname(t), { recursive: true })
  }
  if (fs.existsSync(path.dirname(t))) {
    fs.copyFileSync(registry, t)
    console.log('Synced registry to', t)
  }
}
