# ADR-001: IndexedDB via Dexie como persistência primária e reativa

- **Status**: accepted
- **Date**: 2026-08-05
- **Deciders**: <preencher>
- **Tags**: persistência, dexie, indexeddb, offline-first, reatividade

## Context

O Valore é uma PWA de finanças pessoais offline-first, single-user, sem backend de dados. A persistência original era baseada em **`localStorage`**, com um objeto único serializado em JSON (`valore_app_data_v2`), salvo com debounce e validado por Zod.

Essa abordagem trouxe limitações concretas:

- **Capacidade**: `localStorage` fica em ~5–10 MB e é síncrono, travando a main thread em escritas grandes (histórico patrimonial, cache de mercado, muitas transações).
- **Sem consultas indexadas**: qualquer filtro (ex.: transações pendentes por data, fatura por cartão) exigia carregar todo o blob e filtrar em memória.
- **Reatividade manual**: a UI dependia de `setState` explícito após cada escrita, sujeito a dessincronização entre estado em memória e o que estava salvo.
- **Serialização única**: uma corrupção parcial invalidava o objeto inteiro.

## Decision

Adotar **IndexedDB via Dexie.js** como o mecanismo de persistência **primário e única fonte de verdade** dos dados do usuário.

- Um singleton `ValoreDB extends Dexie` (`lib/db.ts`) declara 11 stores: `assets`, `categories`, `goals`, `transactions`, `creditCards`, `cardExpenses`, `banks`, `patrimonialHistory`, `settings`, `assetCache`, `assetHistory`.
- **Índices** são definidos por store apenas onde há `.where()/.orderBy()`, incluindo índices compostos (`[status+dueDate]`, `[cardId+purchaseDate]`).
- **Versionamento nativo** via `.version(n).stores({...})` — nunca editar versões antigas, apenas adicionar novas (schema atual em v4).
- **Escrita write-through**: as actions (`contexts/hooks/use-actions*.ts`) gravam direto no Dexie (`db.table(...).add/put/delete`), sem estado intermediário.
- **Leitura reativa**: `hooks/useLiveDb.ts` usa `useLiveQuery` (dexie-react-hooks) — cada store é uma query independente, então mudar `transactions` não re-executa a query de `assets`. `data-context` distribui esses dados live para os contextos de domínio.
- `localStorage` é **rebaixado** a papéis auxiliares apenas: fast-path cache de totais (percepção de performance), flag de versão de storage e o Update Gate de migração. Não é mais fonte de verdade.
- A migração de dados legados de `localStorage` → IndexedDB é intermediada por um **Update Gate** que exige download de backup antes de migrar (decisão de UX responsável).

## Consequences

### Positive
- Capacidade muito maior e escritas assíncronas — não bloqueiam a UI.
- Consultas indexadas eficientes (inclusive índices compostos) sem carregar tudo em memória.
- Reatividade automática: `useLiveQuery` mantém a UI sempre em sincronia com o banco, eliminando a classe de bugs de "estado dessincronizado".
- Reatividade granular por store reduz re-renders desnecessários.
- Migrações de schema versionadas e explícitas.

### Negative
- Migração de usuários existentes exige o Update Gate + backup (complexidade extra, código de transição).
- IndexedDB é assíncrono: todas as actions viram `async`, exigindo cuidado com estados de loading (`isLoaded`).
- Resíduos de `localStorage` (constantes, fast-path cache) permanecem e podem confundir — precisam de limpeza/documentação (ver checklist 2.2).
- Geração de ID em memória (`generateId`) é frágil diante do `++id` nativo; migração recomendada (ver ADR e checklist).

### Neutral
- Dexie adiciona dependência (~), mas madura e amplamente usada.
- O padrão exige disciplina: toda escrita deve passar pelas actions, nunca por caminhos paralelos.

## Links
- Implementação: `lib/db.ts`, `hooks/useLiveDb.ts`, `contexts/domains/data-context.tsx`, `contexts/hooks/use-actions.ts`
- Relacionado: [[ADR-002-divisao-estado-por-dominios]] (consome os dados live), [[ADR-003-api-routes-proxy-cotacoes]] (usa `assetCache`/`assetHistory`)
