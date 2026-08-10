# AI Harness Kit

Open source kit para instalar, verificar e evoluir harness em projetos com agentes de código.

## Pacotes

- `@ai-harness/cli` — `harness`, `create-harness`
- `@ai-harness/mcp` — MCP server para contexto e verify

## Quick start

```bash
npx create-harness@latest my-app --template vite-react-tailwind-analitico
cd my-app && npm install
npx @ai-harness/cli doctor
npx @ai-harness/cli verify
```

## Templates

```bash
npx @ai-harness/cli list-templates
```

Presets: `harness-only`, `node-api`, `vite-react-tailwind`, `vite-react-tailwind-analitico`, `vite-react-tailwind-design-system`

## Dev

```bash
npm ci
npm run compose:all
npm run build
npm test
```

Playbook: [ai-harness-playbook](https://github.com/ivanbelshoff/ai-harness-playbook)
