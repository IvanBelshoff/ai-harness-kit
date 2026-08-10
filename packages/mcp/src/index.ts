import fs from 'node:fs'
import path from 'node:path'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { execSync } from 'node:child_process'

function findRoot(): string {
  const fromEnv = process.env.HARNESS_ROOT
  if (fromEnv && fs.existsSync(path.join(fromEnv, 'harness'))) return fromEnv

  let dir = process.cwd()
  while (true) {
    if (fs.existsSync(path.join(dir, 'harness'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) throw new Error('harness/ not found')
    dir = parent
  }
}

function readFile(root: string, rel: string): string {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) throw new Error(`Missing ${rel}`)
  return fs.readFileSync(p, 'utf8')
}

const root = findRoot()

const server = new Server(
  { name: 'ai-harness-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'get_context', description: 'Read docs/harness/context.md', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_glossary', description: 'Read docs/harness/glossary.md', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_invariants', description: 'Read docs/harness/invariants.md', inputSchema: { type: 'object', properties: {} } },
    { name: 'list_procedures', description: 'List harness/procedures/*.md', inputSchema: { type: 'object', properties: {} } },
    {
      name: 'get_procedure',
      description: 'Read a procedure by name',
      inputSchema: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name']
      }
    },
    { name: 'run_verify', description: 'Run harness verify in project root', inputSchema: { type: 'object', properties: {} } }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    if (name === 'get_context') {
      return { content: [{ type: 'text', text: readFile(root, 'docs/harness/context.md') }] }
    }
    if (name === 'get_glossary') {
      return { content: [{ type: 'text', text: readFile(root, 'docs/harness/glossary.md') }] }
    }
    if (name === 'get_invariants') {
      return { content: [{ type: 'text', text: readFile(root, 'docs/harness/invariants.md') }] }
    }
    if (name === 'list_procedures') {
      const procDir = path.join(root, 'harness', 'procedures')
      const files = fs.existsSync(procDir)
        ? fs.readdirSync(procDir).filter((f) => f.endsWith('.md'))
        : []
      return { content: [{ type: 'text', text: files.join('\n') }] }
    }
    if (name === 'get_procedure') {
      const procName = String((args as { name?: string })?.name ?? '')
      const file = procName.endsWith('.md') ? procName : `${procName}.md`
      return {
        content: [{ type: 'text', text: readFile(root, path.join('harness', 'procedures', file)) }]
      }
    }
    if (name === 'run_verify') {
      const out = execSync('npx @ai-harness/cli verify', { cwd: root, encoding: 'utf8' })
      return { content: [{ type: 'text', text: out }] }
    }
    throw new Error(`Unknown tool: ${name}`)
  } catch (err) {
    return {
      content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }],
      isError: true
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
