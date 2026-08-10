# Invariantes: Tasks API

1. **Título único por owner:** `(ownerId, title)` não pode duplicar entre tasks ativas.
2. **Entidade canônica:** usar `Task` no código e na API; não criar sinônimos paralelos.
3. **Contrato `/api/v1`:** campos públicos estáveis; breaking change exige decisão em `decisions.md`.

Testes devem cobrir (1) e (2) na fatia de tasks.
