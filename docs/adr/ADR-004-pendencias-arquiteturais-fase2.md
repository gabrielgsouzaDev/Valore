# ADR-004: Pendências Arquiteturais (Auditoria Fase 2)

- **Status**: proposed
- **Date**: 2026-08-05
- **Deciders**: <preencher>
- **Tags**: arquitetura, integridade-de-dados, segurança, ui, qualidade, débito-técnico

> **Natureza deste ADR**: registro consolidado das decisões **arquiteturais** a tomar após a auditoria da Fase 2. Cada item é uma decisão autônoma com trade-offs — quando priorizado e detalhado, pode ser promovido a um ADR próprio (ADR-006+) e este passa a rastreá-lo. Pendências **de código/bugs** (sem decisão estrutural) estão separadas no [[ADR-005-pendencias-de-codigo-fase2]].

## Context

A auditoria da Fase 2 (bugs, frontend/design, backend/APIs, dependências) revelou não só bugs pontuais, mas **decisões estruturais ausentes ou inconsistentes** que geram classes inteiras de problemas. Registrá-las como decisões — e não como tickets soltos — evita que a correção de um sintoma reintroduza o problema em outro ponto.

## Decision

Adotar as seguintes diretrizes arquiteturais. Prioridade: 🔴 alta · 🟡 média · ⚪ baixa.

### A-1 🔴 Modelo de integridade para efeitos colaterais de transações
**Problema**: `markAsPaid`/`addTransaction` (pago) aplicam efeitos colaterais — incrementam `category.spent` e ajustam `bank.balance` —, mas `deleteTransaction`/`updateTransaction` **não os revertem**. Excluir ou editar uma transação paga infla permanentemente gasto e saldo. Além disso, a lógica de efeitos colaterais está **duplicada** entre `addTransaction` e `markAsPaid`.
**Decisão**: tratar `spent` e `balance` como **valores derivados**, não campos mutáveis acumulados ad-hoc. Duas opções:
- (Recomendada) **Derivar sob demanda**: `spent` = soma das transações pagas da categoria; `balance` = saldo inicial ± transações pagas do banco. Elimina a classe de bugs de dessincronização.
- (Alternativa) Manter acumulado, mas centralizar os efeitos em **uma única função reversível** (`applyTransactionEffects(tx, sign)`) chamada com `+1` ao pagar e `-1` ao excluir/estornar/editar. Exige "estorno" explícito.
**Trade-off**: derivar tem custo de cálculo (mitigável com memo/índices); acumular é rápido mas frágil.
_Refs_: `contexts/hooks/use-actions-extended.ts:40,86`.

### A-2 🔴 Fonte única de verdade para regras derivadas (reserva de emergência)
**Problema**: `suggestedEmergencyFundMeta` é calculado por **duas fórmulas divergentes**: `computeEmergencyMeta` em `app-context.tsx` (`totalBudgeted × meses` / fallback `renda × 0,7 × meses`) e outra em `planning-context.tsx` (`(despesasFixas + médiaCartão) × meses`). No merge do `useApp()`, a versão do `core` vence e a do `planning` vira **código morto** — mas ambas existem e confundem.
**Decisão**: definir **uma única** fórmula canônica num serviço puro (`lib/services/calculations.ts`), consumida por todos. Remover a duplicata. Documentar a regra escolhida.
_Refs_: `contexts/app-context.tsx:144`, `contexts/domains/planning-context.tsx:60`.

### A-3 🟡 Endurecimento e resiliência do proxy de cotações (estende ADR-003)
**Problema**: os endpoints `/api/assets/*` são **abertos e sem rate limiting** — qualquer cliente pode martelar `/api/assets/sync` e **esgotar a cota do `BRAPI_TOKEN`**. Não há validação (Zod) dos query params nem `encodeURIComponent` server-side na busca. Sem provedor de fallback (ponto único de falha).
**Decisão**:
- Adicionar **rate limiting** por IP/sessão nos route handlers.
- **Validar/normalizar** entradas (whitelist de tickers `[A-Z0-9]`, `encodeURIComponent`, limite de qtd por request).
- Avaliar **cache server-side compartilhado** (não só por-cliente no Dexie) e **provedor de fallback**.
_Refs_: `app/api/assets/{sync,detail,search}/route.ts`.

### A-4 🟡 Padronização da camada de UI (diálogos responsivos)
**Problema**: existe a abstração `ResponsiveDialog` (Dialog no desktop / Drawer no mobile), mas **apenas 1 componente a usa** (`TransactionDialog`). ~10 diálogos (asset, category, goal, subcategory, CardDialogs, BankManagement, AssetDetailsModal, EmergencyFundDialog, ofx-importer) usam `Dialog` cru → **UX mobile inconsistente** e header/footer/estilos **duplicados** em cada um.
**Decisão**: adotar `ResponsiveDialog` como **padrão único** para todos os modais; migrar os existentes. Centralizar estilos compartilhados.
_Refs_: `components/responsive-dialog.tsx` (+ 13 arquivos com Dialog/Drawer).

### A-5 🟡 Fonte única de verdade para temas (fim da duplicação inline)
**Problema**: o script anti-flash em `app/layout.tsx` **replica os presets de tema inline** e só inclui **3 dos 8 temas**. Usuários nos outros 5 (arctic, snow, obsidian, forest, slate) sofrem **flash do tema errado** (cai em `paper`). O source-of-truth real é `lib/theme-presets.ts`.
**Decisão**: gerar o snippet anti-flash a partir de `lib/theme-presets.ts` (ex.: injeção em build/SSR dos presets serializados) para que os 8 temas fiquem cobertos e não haja divergência.
_Refs_: `app/layout.tsx:73-77`, `lib/theme-presets.ts`.

### A-6 🟡 Segurança da migração LocalStorage → IndexedDB (sem perda silenciosa)
**Problema**: `migrateLocalStorageToIndexedDB` **limpa as stores do Dexie antes de validar** e, se o Zod falhar (`data = null`), não insere nada, **marca como migrado** e retorna `success: true` — caminho de **perda silenciosa de dados**. (Detalhe do bug em ADR-005/C-1; a **decisão de política** fica aqui.)
**Decisão**: política de migração **fail-safe**: (1) nunca limpar destino antes de validar origem; (2) migração transacional "tudo-ou-nada"; (3) só marcar `migrado` após verificação de integridade real; (4) em falha, preservar dados e **não** marcar migrado. Considerar substituir a migração via localStorage por versionamento nativo do Dexie quando possível.

### A-7 ⚪ Estratégia de estado unificada
**Problema**: coexistem múltiplas estratégias de estado — Dexie live (fonte de verdade), fast-path cache em `localStorage`, e um **singleton mutável em nível de módulo** (`categoriesSetterRef`). Isso dificulta o raciocínio sobre a fonte de verdade.
**Decisão**: documentar explicitamente os papéis (Dexie = verdade; localStorage = cache/UX; nada de refs globais mutáveis) e remover plumbing morto (ver ADR-005/C-4).

## Consequences

### Positive
- Elimina classes inteiras de bugs (dessincronização de saldos, flash de tema, perda em migração) em vez de sintomas isolados.
- UI e regras de negócio ganham fonte única de verdade → menos duplicação e divergência.
- Proxy mais seguro protege a cota de API e reduz superfície de abuso.

### Negative
- Esforço de refatoração não-trivial (A-1 e A-4 tocam muitos arquivos).
- Derivar valores (A-1) pode exigir otimização de performance.
- Rate limiting (A-3) adiciona infraestrutura/estado no servidor.

### Neutral
- Vários itens estendem decisões já registradas (ADR-001, ADR-003) — evolução, não ruptura.

## Links
- Auditoria de código correlata: [[ADR-005-pendencias-de-codigo-fase2]]
- Estende: [[ADR-001-indexeddb-dexie-persistencia-primaria]], [[ADR-002-divisao-estado-por-dominios]], [[ADR-003-api-routes-proxy-cotacoes]]
- Checklist operacional: `docs/checklist-organizacao.md`
