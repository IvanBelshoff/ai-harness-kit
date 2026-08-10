# Trigger: verificar fatia (Tasks API)

## Quando

Após implementar rota ou domínio de Task.

## Comandos

```bash
npm run typecheck
npm test -- -t Task
```

## Critério de pronto

- Typecheck verde
- Testes Task verdes
- DoD do procedimento marcado

## Se falhar

Corrigir e repetir. Erro recorrente → patch no harness.
