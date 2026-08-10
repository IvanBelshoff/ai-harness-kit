# Procedimento: add-tracking-event

## Objetivo

Registrar novo event de produto sem quebrar naming.

## Passos

1. Definir nome snake_case no glossário se novo.
2. Implementar chamada `track()` no ponto certo.
3. Teste que event foi emitido (buffer local).
4. Rodar verify-slice.

## DoD

- [ ] Event no glossário ou reutilizado
- [ ] Teste analytics verde

## Não fazer

- Renomear events existentes
- Enviar PII no payload
