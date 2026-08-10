# E2E local (pre-npm)

Valida o kit antes de publicar `@ai-harness/cli` no npm.

## Rodar

```bash
npm run compose:all
npm run build
npm run e2e:local
```

Sandbox: `~/harness-e2e/` (10 repos + `README-results.md` + `results.json`).

## O que cobre

| # | Repo | Comandos |
|---|------|----------|
| 1-4 | Presets stable | `init`, `doctor`, `verify` |
| 5-6 | Brownfield | `init --template harness-only` |
| 7 | Mirror | `mirror --cursor --github-actions` |
| 8 | Harvest | `harvest`, `propose` |
| 9 | Verify loop | fail → fix → pass |
| 10 | npm pack | tarball + `npx harness` |
| + | MCP smoke | CLI verify parity |

## Go/no-go publish

Ver [GO-NO-GO.md](./GO-NO-GO.md).
