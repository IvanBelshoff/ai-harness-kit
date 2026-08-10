import fs from 'node:fs'
import path from 'node:path'

const COMMANDS_HEADING = /^##\s+Comandos\s*$/m

export function findVerifySlicePath(projectRoot: string): string {
  const candidates = [
    path.join(projectRoot, 'harness', 'triggers', 'verify-slice.md'),
    path.join(projectRoot, 'harness', 'controls', 'triggers', 'verify-slice.md')
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  throw new Error('verify-slice.md not found under harness/triggers/')
}

export function parseVerifyCommands(markdown: string): string[] {
  const match = COMMANDS_HEADING.exec(markdown)
  if (!match) return []

  const after = markdown.slice(match.index + match[0].length)
  const commands: string[] = []
  const fence = /```(?:bash|sh|shell)?\s*\n([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = fence.exec(after)) !== null) {
    const block = m[1]
    for (const line of block.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      commands.push(trimmed)
    }
    const nextHeading = after.indexOf('##', m.index + m[0].length)
    if (nextHeading !== -1 && nextHeading < (fence.lastIndex ?? 0)) break
  }
  return commands
}

export function readVerifyCommands(projectRoot: string): string[] {
  const filePath = findVerifySlicePath(projectRoot)
  const md = fs.readFileSync(filePath, 'utf8')
  return parseVerifyCommands(md)
}
