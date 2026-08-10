import fs from 'node:fs'
import path from 'node:path'

export interface DoctorCheck {
  id: string
  ok: boolean
  message: string
  level: number
}

export interface DoctorResult {
  level: number
  checks: DoctorCheck[]
}

function fileExists(root: string, rel: string): boolean {
  return fs.existsSync(path.join(root, rel))
}

function fileNonEmpty(root: string, rel: string): boolean {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) return false
  return fs.readFileSync(p, 'utf8').trim().length > 20
}

export function runDoctor(projectRoot: string, verifyHasCommands: boolean): DoctorResult {
  const checks: DoctorCheck[] = []

  checks.push({
    id: 'agents',
    ok: fileExists(projectRoot, 'AGENTS.md'),
    message: 'AGENTS.md na raiz',
    level: 1
  })

  checks.push({
    id: 'context',
    ok: fileNonEmpty(projectRoot, 'docs/harness/context.md'),
    message: 'docs/harness/context.md preenchido',
    level: 2
  })

  checks.push({
    id: 'glossary',
    ok: fileNonEmpty(projectRoot, 'docs/harness/glossary.md'),
    message: 'docs/harness/glossary.md com termos',
    level: 2
  })

  checks.push({
    id: 'invariants',
    ok: fileNonEmpty(projectRoot, 'docs/harness/invariants.md'),
    message: 'docs/harness/invariants.md',
    level: 2
  })

  const procDir = path.join(projectRoot, 'harness', 'procedures')
  const hasProcedure =
    fs.existsSync(procDir) && fs.readdirSync(procDir).some((f) => f.endsWith('.md'))
  checks.push({
    id: 'procedure',
    ok: hasProcedure,
    message: 'harness/procedures/*.md',
    level: 3
  })

  checks.push({
    id: 'verify',
    ok: verifyHasCommands,
    message: 'verify-slice com comandos reais',
    level: 3
  })

  const triggersDir = path.join(projectRoot, 'harness', 'triggers')
  checks.push({
    id: 'triggers',
    ok: fs.existsSync(path.join(triggersDir, 'verify-slice.md')),
    message: 'harness/triggers/verify-slice.md',
    level: 3
  })

  let level = 0
  if (checks.find((c) => c.id === 'agents')?.ok) level = 1
  if (
    checks.filter((c) => c.level === 2).every((c) => c.ok) &&
    level >= 1
  ) {
    level = 2
  }
  if (
    checks.filter((c) => c.level === 3).every((c) => c.ok) &&
    level >= 2
  ) {
    level = 3
  }
  if (level >= 3 && fs.existsSync(path.join(projectRoot, 'harness.config.json'))) {
    level = 4
  }

  return { level, checks }
}
