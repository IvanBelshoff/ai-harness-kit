import fs from 'node:fs'
import path from 'node:path'
import { readVerifyCommands } from './verify-slice.js'

export interface HarvestSignal {
  type: string
  artifact: string
  message: string
  confidence: 'high' | 'medium' | 'low'
}

export interface Proposal {
  signal: HarvestSignal
  artifact: string
  rationale: string
  diff: string
  auto: boolean
}

function readPackageScripts(root: string): Record<string, string> {
  const pkgPath = path.join(root, 'package.json')
  if (!fs.existsSync(pkgPath)) return {}
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  return pkg.scripts ?? {}
}

function readGlossaryTerms(root: string): Set<string> {
  const p = path.join(root, 'docs/harness/glossary.md')
  if (!fs.existsSync(p)) return new Set()
  const text = fs.readFileSync(p, 'utf8')
  const terms = new Set<string>()
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*([^|]+)\s*\|/)
    if (m && !m[1].includes('Termo') && m[1].trim() !== '---') {
      terms.add(m[1].trim().toLowerCase())
    }
  }
  return terms
}

function scanSrcIdentifiers(root: string): string[] {
  const srcDir = path.join(root, 'src')
  if (!fs.existsSync(srcDir)) return []
  const ids: string[] = []
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry)
      if (fs.statSync(full).isDirectory()) walk(full)
      else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
        const content = fs.readFileSync(full, 'utf8')
        const exports = content.matchAll(
          /export\s+(?:type\s+)?(?:class|interface|function)\s+(\w+)/g
        )
        for (const m of exports) ids.push(m[1])
      }
    }
  }
  walk(srcDir)
  return ids
}

export function harvestSignals(projectRoot: string): HarvestSignal[] {
  const signals: HarvestSignal[] = []

  try {
    const verifyCmds = readVerifyCommands(projectRoot)
    const scripts = readPackageScripts(projectRoot)
    const scriptCmds = Object.entries(scripts)
      .filter(([name]) =>
        ['typecheck', 'lint', 'test', 'build', 'verify'].includes(name)
      )
      .map(([name]) => `npm run ${name}`)

    for (const cmd of scriptCmds) {
      if (!verifyCmds.some((v) => v.includes(cmd.replace('npm run ', '')))) {
        signals.push({
          type: 'verify-sync',
          artifact: 'harness/triggers/verify-slice.md',
          message: `Script usado no projeto mas ausente em verify: ${cmd}`,
          confidence: 'high'
        })
      }
    }
  } catch {
    /* no verify file */
  }

  const agentsPath = path.join(projectRoot, 'AGENTS.md')
  if (fs.existsSync(agentsPath)) {
    const agents = fs.readFileSync(agentsPath, 'utf8')
    const paths = agents.matchAll(/`([^`]+)`/g)
    for (const m of paths) {
      const rel = m[1]
      if (rel.includes('/') && !fs.existsSync(path.join(projectRoot, rel))) {
        signals.push({
          type: 'agents-dead-link',
          artifact: 'AGENTS.md',
          message: `Path inexistente referenciado: ${rel}`,
          confidence: 'high'
        })
      }
    }
  }

  const glossary = readGlossaryTerms(projectRoot)
  const ids = scanSrcIdentifiers(projectRoot)
  for (const id of ids) {
    if (!glossary.has(id.toLowerCase()) && id.length > 2) {
      signals.push({
        type: 'glossary-drift',
        artifact: 'docs/harness/glossary.md',
        message: `Export "${id}" sem entrada no glossário`,
        confidence: 'medium'
      })
    }
  }

  const logPath = path.join(projectRoot, '.harness', 'verify.log')
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean)
    const counts = new Map<string, number>()
    for (const line of lines.slice(-50)) {
      counts.set(line, (counts.get(line) ?? 0) + 1)
    }
    for (const [line, count] of counts) {
      if (count >= 2) {
        signals.push({
          type: 'repeated-failure',
          artifact: 'harness/triggers/verify-slice.md',
          message: `Falha repetida (${count}x): ${line.slice(0, 80)}`,
          confidence: 'high'
        })
      }
    }
  }

  return signals
}

export function proposePatches(
  projectRoot: string,
  signals: HarvestSignal[],
  config: { auto?: string[]; propose?: string[]; never?: string[] }
): Proposal[] {
  const proposals: Proposal[] = []
  const autoTypes = new Set(config.auto ?? ['verify-sync', 'agents-dead-link'])
  const neverTypes = new Set(config.never ?? [])

  for (const signal of signals) {
    if (neverTypes.has(signal.type)) continue

    if (signal.type === 'verify-sync') {
      const cmd = signal.message.split(': ').pop() ?? ''
      proposals.push({
        signal,
        artifact: signal.artifact,
        rationale: 'Loop do harness: verify deve espelhar scripts do projeto.',
        diff: `+ ${cmd}`,
        auto: autoTypes.has(signal.type)
      })
    }

    if (signal.type === 'glossary-drift') {
      const term = signal.message.match(/"([^"]+)"/)?.[1] ?? 'Term'
      proposals.push({
        signal,
        artifact: 'docs/harness/glossary.md',
        rationale: 'Vocabulário canônico evita deriva entre chats.',
        diff: `| ${term} | [definir] | [não confundir] |`,
        auto: false
      })
    }

    if (signal.type === 'repeated-failure') {
      proposals.push({
        signal,
        artifact: 'harness/instructions/stack.md',
        rationale: 'Erro recorrente: documentar restrição ou atualizar procedimento.',
        diff: '# Revisar verify-slice e procedimento da fatia atual',
        auto: false
      })
    }
  }

  return proposals
}

export function loadHarnessConfig(projectRoot: string) {
  const p = path.join(projectRoot, 'harness.config.json')
  if (!fs.existsSync(p)) return { evolution: { auto: [], propose: [], never: [] } }
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

export function applyVerifySync(projectRoot: string, cmd: string) {
  const verifyPath = path.join(projectRoot, 'harness', 'triggers', 'verify-slice.md')
  if (!fs.existsSync(verifyPath)) return false
  let md = fs.readFileSync(verifyPath, 'utf8')
  if (md.includes(cmd)) return true
  const fenceEnd = md.indexOf('```', md.indexOf('## Comandos'))
  if (fenceEnd === -1) return false
  const insertAt = md.indexOf('\n```', md.indexOf('## Comandos'))
  if (insertAt === -1) return false
  md = md.slice(0, insertAt) + `\n${cmd}` + md.slice(insertAt)
  fs.writeFileSync(verifyPath, md)
  return true
}
