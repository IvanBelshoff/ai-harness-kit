# Go / no-go: publicar no npm

Checklist após `npm run e2e:local` verde.

| Gate | Status |
|------|--------|
| 4/4 scaffold presets `verify` verde | Requer e2e 12/12 |
| `vite-react-tailwind-design-system` no CI matrix | Sim |
| `npm pack` smoke (repo 10) | Sim |
| Nome npm | Usar `@ai-harness/cli` (não `create-harness` unscoped) |
| Comandos docs | `npx @ai-harness/cli init my-app --template <id>` |
| MCP `run_verify` | Usa `HARNESS_CLI` ou path relativo ao pacote |

## Publicar (manual)

```bash
cd packages/cli && npm publish --access public
cd packages/mcp && npm publish --access public
```

## Post-publish smoke

```bash
npx @ai-harness/cli list-templates
npx @ai-harness/cli init my-smoke --template node-api
```

## Nota

O pacote unscoped `create-harness` no npm é de terceiros. Não usar até registrar nome alternativo (`@ai-harness/create-app`).
