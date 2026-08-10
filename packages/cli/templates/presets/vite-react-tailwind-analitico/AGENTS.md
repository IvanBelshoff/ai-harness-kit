# SPA: índice para agentes

Frontend Vite + React + Tailwind. Componentes com escopo mínimo.

## Stack

- Vite 6, React 19, Tailwind CSS 3
- Vitest + ESLint

## Onde está o harness

- `docs/harness/`
- `harness/procedures/`
- `harness/triggers/verify-slice.md`

## Como verificar

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Regras de ouro

1. Estilos via Tailwind e tokens CSS (`src/index.css`).
2. Novos componentes seguem `harness/procedures/add-component.md`.
3. Sem CSS solto fora de tokens sem decisão.
