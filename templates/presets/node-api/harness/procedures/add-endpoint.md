# Procedimento: add-endpoint (tasks)

## Objetivo

Novo endpoint REST em `/api/v1` alinhado ao glossário e invariantes.

## Inputs

- `docs/harness/glossary.md`, `invariants.md`
- Handlers existentes em `src/`

## Passos

1. Definir método, path e payload usando termos do glossário.
2. Implementar handler + domínio (sem renomear entidades).
3. Adicionar testes de invariante tocados pela rota.
4. Rodar `harness/triggers/verify-slice.md`.

## DoD

- [ ] Rota testada
- [ ] Testes da fatia verdes
- [ ] Sem entidade paralela inventada

## Não fazer

- Refatorar módulos não relacionados
- Mudar campos públicos sem decisão registrada
