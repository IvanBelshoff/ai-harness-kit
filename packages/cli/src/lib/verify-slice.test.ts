import { describe, expect, it } from 'vitest'
import { parseVerifyCommands } from './verify-slice.js'

describe('parseVerifyCommands', () => {
  it('extracts bash commands after Comandos heading', () => {
    const md = `# Trigger

## Comandos

\`\`\`bash
npm run typecheck
# comment
npm test -- --grep Task
\`\`\`

## Critério
`
    const cmds = parseVerifyCommands(md)
    expect(cmds).toEqual(['npm run typecheck', 'npm test -- --grep Task'])
  })
})
