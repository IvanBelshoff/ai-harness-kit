import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const templatesDir = path.join(root, 'templates')

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
    return
  }
  fs.copyFileSync(src, dest)
}

function mergeDir(src, dest) {
  if (!fs.existsSync(src)) return
  copyRecursive(src, dest)
}

const compositions = [
  { preset: 'node-api', stack: 'node-api', domain: 'crud-api' },
  { preset: 'vite-react-tailwind', stack: 'vite-react-tailwind', domain: 'spa-base' },
  {
    preset: 'vite-react-tailwind-analitico',
    stack: 'vite-react-tailwind',
    domain: 'analitico'
  },
  {
    preset: 'vite-react-tailwind-design-system',
    stack: 'vite-react-tailwind',
    domain: 'design-system'
  }
]

function composeOne({ preset, stack, domain }) {
  const out = path.join(templatesDir, 'presets', preset)
  if (fs.existsSync(out)) fs.rmSync(out, { recursive: true, force: true })
  fs.mkdirSync(out, { recursive: true })

  mergeDir(path.join(templatesDir, 'stacks', stack), out)
  if (domain) mergeDir(path.join(templatesDir, 'domains', domain), out)
}

const args = process.argv.slice(2)
if (args.includes('--all')) {
  for (const c of compositions) composeOne(c)
  const harnessOnly = path.join(templatesDir, 'presets', 'harness-only')
  if (fs.existsSync(harnessOnly)) fs.rmSync(harnessOnly, { recursive: true, force: true })
  copyRecursive(path.join(templatesDir, 'stacks', 'harness-only'), harnessOnly)
  console.log('Composed all presets')
} else if (args.length >= 1) {
  const preset = args[0]
  const comp = compositions.find((c) => c.preset === preset)
  if (comp) composeOne(comp)
  else console.error('Unknown preset', preset)
} else {
  for (const c of compositions) composeOne(c)
  const harnessOnly = path.join(templatesDir, 'presets', 'harness-only')
  if (fs.existsSync(harnessOnly)) fs.rmSync(harnessOnly, { recursive: true, force: true })
  copyRecursive(path.join(templatesDir, 'stacks', 'harness-only'), harnessOnly)
  console.log('Composed presets')
}
