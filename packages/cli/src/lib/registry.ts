import fs from 'node:fs'
import path from 'node:path'

export interface TemplateEntry {
  id: string
  name: string
  status: 'stable' | 'beta' | 'coming-soon'
  stack: string[]
  domain: string | null
  maturity: number
  commands: { create: string; initBrownfield: string }
  includes: string[]
}

export interface Registry {
  version: number
  cliMinVersion: string
  templates: TemplateEntry[]
}

export function loadRegistry(registryPath: string): Registry {
  const raw = fs.readFileSync(registryPath, 'utf8')
  return JSON.parse(raw) as Registry
}

export function findTemplate(
  registry: Registry,
  id: string
): TemplateEntry | undefined {
  return registry.templates.find((t) => t.id === id)
}

export function filterTemplates(
  registry: Registry,
  filters: { stack?: string; domain?: string; status?: string }
): TemplateEntry[] {
  return registry.templates.filter((t) => {
    if (filters.status && t.status !== filters.status) return false
    if (filters.domain && t.domain !== filters.domain) return false
    if (filters.stack && !t.stack.includes(filters.stack)) return false
    return true
  })
}

export function getPresetPath(templatesDir: string, templateId: string): string {
  return path.join(templatesDir, 'presets', templateId)
}

export function resolveTemplateId(
  registry: Registry,
  options: { template?: string; stack?: string; domain?: string }
): string {
  if (options.template) {
    const t = findTemplate(registry, options.template)
    if (!t) throw new Error(`Unknown template: ${options.template}`)
    return t.id
  }
  if (options.stack && options.domain) {
    const match = registry.templates.find(
      (t) =>
        t.stack.includes(options.stack!) &&
        t.domain === options.domain &&
        t.status === 'stable'
    )
    if (match) return match.id
    return `${options.stack}-${options.domain}`.replace(/_/g, '-')
  }
  throw new Error('Provide --template <id> or --stack and --domain')
}
