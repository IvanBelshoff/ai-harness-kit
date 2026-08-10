# AGENTS.md (template)

Substitua na raiz do seu repositório.

## O que é o projeto

[2 a 5 linhas: problema e resultado esperado]

## Stack

- [linguagem / framework]
- [test runner]

## Onde está o harness

- Contexto: `docs/harness/context.md`
- Invariantes: `docs/harness/invariants.md`
- Glossário: `docs/harness/glossary.md`
- Decisões: `docs/harness/decisions.md`
- Controles: `harness/instructions|procedures|roles|triggers|bridges/`

## Como verificar

```bash
# ex.: npm test / harness verify
```

## Regras de ouro

1. [invariante crítica 1]
2. Preferir procedimentos em `harness/procedures/` a improvisar
