# Tasks API: índice para agentes

API REST mínima de tarefas (CRUD). Domínio simples para aprender harness.

## Stack

- Node.js + HTTP JSON em `/api/v1`
- Persistência em memória
- Vitest na fatia tocada

## Onde está o harness

- Contexto: `docs/harness/context.md`
- Invariantes: `docs/harness/invariants.md`
- Glossário: `docs/harness/glossary.md`
- Procedimentos: `harness/procedures/`
- Verificação: `harness/triggers/verify-slice.md`

## Como verificar

```bash
npm run typecheck
npm test -- -t Task
```

## Regras de ouro

1. Entidade canônica: **Task** (não `Todo`, `TodoItem`, `Task2`).
2. Título único por `ownerId`.
3. Novos endpoints seguem `harness/procedures/add-endpoint.md`.
