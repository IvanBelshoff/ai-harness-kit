import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  copyRecursive,
  finalizeHarnessLayout,
  writeDefaultConfig
} from '../lib/copy.js'
import { getPresetPath, loadRegistry, resolveTemplateId } from '../lib/registry.js'
import { getTemplatesDir } from '../lib/paths.js'

export interface InitOptions {
  template?: string
  stack?: string
  domain?: string
  target: string
}

export function runInit(options: InitOptions) {
  const templatesDir = getTemplatesDir()
  const registry = loadRegistry(path.join(templatesDir, 'registry.json'))
  const templateId = resolveTemplateId(registry, options)
  const presetPath = getPresetPath(templatesDir, templateId)

  if (!fs.existsSync(presetPath)) {
    throw new Error(
      `Preset not found: ${presetPath}. Run npm run compose:all in ai-harness-kit.`
    )
  }

  const target = path.resolve(options.target)
  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    const entries = fs.readdirSync(target).filter(
      (e) => e !== '.git' && e !== 'node_modules'
    )
    if (entries.length > 0) {
      throw new Error(`Target directory not empty: ${target}`)
    }
  }

  fs.mkdirSync(target, { recursive: true })
  copyRecursive(presetPath, target)
  finalizeHarnessLayout(target)
  writeDefaultConfig(target)

  console.log(`Initialized harness template "${templateId}" at ${target}`)
}

export function runInitIntoExisting(target: string, templateId: string) {
  const templatesDir = getTemplatesDir()
  const presetPath = getPresetPath(templatesDir, templateId)
  if (!fs.existsSync(presetPath)) {
    throw new Error(`Preset not found: ${templateId}`)
  }
  const resolved = path.resolve(target)
  copyRecursive(presetPath, resolved)
  finalizeHarnessLayout(resolved)
  writeDefaultConfig(resolved)
  console.log(`Applied template "${templateId}" into ${resolved}`)
}
