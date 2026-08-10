import { findProjectRoot } from '../lib/paths.js'
import { mirrorCursor, mirrorGitHubActions } from '../lib/mirror.js'
import { readVerifyCommands } from '../lib/verify-slice.js'

export function runMirror(options: { cursor?: boolean; githubActions?: boolean }) {
  const root = findProjectRoot()
  if (!root) {
    console.error('Not in a harness project')
    process.exit(1)
  }

  const commands = readVerifyCommands(root)
  if (commands.length === 0) {
    console.error('No verify commands to mirror')
    process.exit(1)
  }

  if (options.cursor) {
    mirrorCursor(root, commands)
    console.log('Wrote .cursor/hooks.json and .cursor/rules/harness.mdc')
  }

  if (options.githubActions) {
    mirrorGitHubActions(root, commands)
    console.log('Wrote .github/workflows/verify-slice.yml')
  }

  if (!options.cursor && !options.githubActions) {
    mirrorCursor(root, commands)
    mirrorGitHubActions(root, commands)
    console.log('Wrote Cursor hooks and GitHub Actions workflow')
  }
}
