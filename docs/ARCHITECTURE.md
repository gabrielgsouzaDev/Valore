# Arquitetura — Valore

Visão geral da arquitetura **atual** do Valore. Para o *porquê* de cada decisão
estrutural, ver os ADRs em [`adr/`](adr/).

## Princípio central: o banco é a fonte de verdade

O Valore não mantém os dados em estado de componente como fonte de verdade. Toda
escrita vai direto ao **IndexedDB** (via [Dexie](https://dexie.org/)); a UI apenas
**observa** o banco com `useLiveQuery`. Isso elimina a classe de bug "estado da tela
divergiu do que foi salvo" e dá reatividade granular — cada consulta re-renderiza só
quem depende dela.

```
Ação do usuário
   │  db.<store>.add/put/delete(...)         (escrita direta no IndexedDB)
   ▼
IndexedDB (Dexie)
   │  useLiveQuery detecta a mudança         (hooks/useLiveDb.ts)
   ▼
data-context  →  contextos de domínio  →  useApp()  →  componentes
```

## Camadas

### 1. Persistência — `lib/db.ts`, `hooks/useLiveDb.ts`
- `ValoreDB` estende `Dexie` com stores versionadas (`assets`, `categories`,
  `creditCards`, `cardExpenses`, `banks`, `patrimonialHistory`, `settings`, além de
  caches de mercado). Migrações de schema são declarativas (`.version(n).stores(...)`).
- `useLiveDb` centraliza as `useLiveQuery` de cada store e expõe uma flag `isLoaded`
  (true quando todas as consultas iniciais retornaram).
- **Update Gate** (`components/providers.tsx` + `hooks/useUpdateGate`): bloqueia a UI
  quando uma migração é necessária e exige backup antes de prosseguir.

### 2. Estado por domínio — `contexts/`
O antigo `AppContext` monolítico foi dividido em provedores de domínio (ADR-002):

| Contexto | Responsabilidade |
|----------|------------------|
| `data-context` | Expõe os dados reativos crus do `useLiveDb` |
| `investment-context` | Ativos, patrimônio, distribuição, sync de preços |
| `budget-context` | Categorias, orçado × gasto |
| `banking-context` | Bancos e contas |
| `core-context` | Settings, temas, privacidade, backup/restore, snapshots |

`app-context.tsx` compõe os provedores e o hook `useApp()` agrega tudo num único
ponto de consumo para as páginas.

### 3. Regras de negócio — `lib/services/`
As regras financeiras sensíveis são **funções puras**, sem dependência de React ou do
banco, o que as torna testáveis isoladamente:
- `calculateInvestmentDistribution` — as 4 estratégias de aporte (rebalanceamento,
  proporcional, cascata, preço-teto).
- `calculateInvoices` — projeção de faturas de cartão (parcelas, dia de fechamento).
- `calculateTotalNetWorth` / `calculateTotalBudgeted` / `calculateTotalSpent`.
- `getEconomyBarColor` / `getAssetBarColor` — faixas de saúde por cor.

Cobertas por **22 testes** em `lib/services/calculations.test.ts` (Vitest).

### 4. Dados de mercado — `app/api/assets/`
Cotações são o único dado que sai do dispositivo. Três *route handlers* do Next.js
atuam como proxy server-side, injetando o `BRAPI_TOKEN` (nunca exposto ao cliente):
`sync` (lote), `detail` (fundamentos) e `search` (busca de tickers). As respostas são
cacheadas no Dexie (TTL 15 min) e há throttle por ativo para poupar a cota da API.

### 5. Temas — `lib/theme-presets.ts`, `app/globals.css`, `core-context`
33 presets (10 claros, 23 escuros). Cada tema é um conjunto de variáveis CSS
`--theme-*` aplicadas na raiz; um script de boot em `app/layout.tsx` aplica o tema
salvo antes da hidratação (anti-flash), e `applyThemeVariables` cuida da troca em
runtime, alternando também a classe `dark`.

## Front-end
- **Next.js 16 (App Router) + React 19 + TypeScript**, cinco rotas de página
  (`/`, `/investimentos`, `/economia`, `/cartoes`, `/configuracoes`).
- **Tailwind CSS 4** com tokens de tema; **Radix UI (shadcn/ui)** para primitivos;
  **Framer Motion** para transições; **Recharts** (import dinâmico) para gráficos.
- **PWA** via `@ducanh2912/next-pwa` (Workbox): app-shell cacheado, `NetworkFirst`
  para `/api/*` e `CacheFirst` para fontes.

## Mapa de diretórios

```
app/            rotas (App Router) + api/ (proxy de cotações) + layout/manifest
components/     UI compartilhada (ui/ = shadcn) e widgets
contexts/       data-context + contextos de domínio (ADR-002)
hooks/          useLiveDb, usePWA, useUpdateGate, ...
lib/            db (Dexie), services (regras puras + testes), schema (Zod), tipos
docs/adr/       Architecture Decision Records
```
