# Procedimento: adjust-primary-button

## Objetivo

Alterar somente `--color-primary` em `src/index.css`.

## Passos

1. Confirmar pedido cita um token, não "modernizar UI".
2. Editar apenas o valor do token.
3. Verificar diff mínimo.
4. Rodar `harness/triggers/verify-slice.md`.

## DoD

- [ ] Diff contém só token alvo
- [ ] Trigger verde

## Não fazer

- Alterar tipografia, grid, outros componentes
- Introduzir nova lib de UI
