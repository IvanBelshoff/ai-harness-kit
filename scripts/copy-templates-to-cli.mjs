import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'templates')
const dest = path.join(root, 'packages', 'cli', 'templates')

function copyRecursive(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir)) {
    const s = path.join(srcDir, entry)
    const d = path.join(destDir, entry)
    if (fs.statSync(s).isDirectory()) copyRecursive(s, d)
    else fs.copyFileSync(s, d)
  }
}

if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true })
copyRecursive(src, dest)
console.log('Copied templates to packages/cli/templates')
