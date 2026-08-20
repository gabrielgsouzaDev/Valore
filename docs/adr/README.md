# Architecture Decision Records (ADRs)

Registro das decisões arquiteturais do Valore. Cada ADR captura o **contexto**, a **decisão** e as **consequências** — para que decisões já tomadas não precisem ser re-descobertas via arqueologia de código.

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](ADR-001-indexeddb-dexie-persistencia-primaria.md) | IndexedDB via Dexie como persistência primária e reativa | accepted | 2026-08-05 |
| [ADR-002](ADR-002-divisao-estado-por-dominios.md) | Divisão de estado por domínios (fim do AppContext monolítico) | accepted | 2026-08-05 |
| [ADR-003](ADR-003-api-routes-proxy-cotacoes.md) | API Routes do Next.js como proxy para cotações (Brapi) | accepted | 2026-08-05 |
| [ADR-004](ADR-004-pendencias-arquiteturais-fase2.md) | Pendências arquiteturais (Auditoria Fase 2) | proposed | 2026-08-05 |
| [ADR-005](ADR-005-pendencias-de-codigo-fase2.md) | Pendências de código / bugs (Auditoria Fase 2) | proposed | 2026-08-05 |

## Convenções
- Arquivos: `ADR-NNN-<slug>.md`, numeração sequencial, nunca reutilizada.
- Status: `proposed` → `accepted` → (`superseded` por ADR-XXX / `deprecated`).
- Ao substituir uma decisão, criar um **novo** ADR e marcar o antigo como `superseded`.
- Relações entre ADRs são anotadas na seção **Links** com `[[ADR-...]]`.

> Nota: as três primeiras ADRs registram **decisões já implementadas** no código (retroativas), por isso já nascem como `accepted`. Preencher o campo **Deciders** conforme validação da equipe.
