# Contexto: Tasks API

## Problema

API REST mínima para gerenciar tarefas por usuário (`ownerId`).

## Escopo

**In**

- CRUD de Task em `/api/v1`
- Invariantes testadas em Vitest

**Out**

- Auth completa, multi-tenant avançado

## Arquitetura

```text
src/server.ts → src/tasks.ts (domínio em memória)
```
