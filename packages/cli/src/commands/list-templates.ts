import path from 'node:path'
import {
  filterTemplates,
  loadRegistry
} from '../lib/registry.js'
import { getTemplatesDir } from '../lib/paths.js'

export function runListTemplates(filters: {
  stack?: string
  domain?: string
  status?: string
}) {
  const templatesDir = getTemplatesDir()
  const registry = loadRegistry(path.join(templatesDir, 'registry.json'))
  const list = filterTemplates(registry, filters)

  if (list.length === 0) {
    console.log('No templates match filters.')
    return
  }

  for (const t of list) {
    console.log(`${t.id} [${t.status}] maturity ${t.maturity}`)
    console.log(`  ${t.name}`)
    if (t.stack.length) console.log(`  stack: ${t.stack.join(', ')}`)
    if (t.domain) console.log(`  domain: ${t.domain}`)
    console.log(`  create: ${t.commands.create}`)
    console.log('')
  }
}
