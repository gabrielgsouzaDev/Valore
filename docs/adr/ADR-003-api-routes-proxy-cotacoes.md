# ADR-003: API Routes do Next.js como proxy para cotações (Brapi)

- **Status**: accepted
- **Date**: 2026-08-05
- **Deciders**: <preencher>
- **Tags**: api, proxy, segurança, tokens, rate-limit, brapi, cache

## Context

O Valore precisa de cotações de mercado (ações, FIIs, ETFs) da API **Brapi**, que exige um **token de autenticação** (`BRAPI_TOKEN`) para planos pagos e impõe limites de requisição.

Restrições e riscos:

- Sendo uma app client-side, chamar a Brapi **direto do browser** exporia o token no bundle/rede — inaceitável.
- Chamadas diretas do cliente também não têm um ponto central para caching, timeout e tratamento de erro.
- A revisão `docs/code-review-06-04.md` (item 2.3) apontou uma **inconsistência**: parte do código (`useAssetDetail`) chamava a Brapi diretamente, enquanto a sincronização em lote já usava o proxy — comportamento e autenticação divergentes.

## Decision

Rotear **todas** as chamadas à Brapi por **API Routes do Next.js (App Router)**, que atuam como proxy server-side.

- Três route handlers em `app/api/assets/`:
  - **`sync/route.ts`** — cotações em lote: `GET /api/assets/sync?tickers=PETR4,VALE3`.
  - **`detail/route.ts`** — detalhe/fundamentos de um ticker: `GET /api/assets/detail?ticker=...`.
  - **`search/route.ts`** — busca de tickers.
- O token é lido **apenas no servidor** via `process.env.BRAPI_TOKEN` e injetado na chamada à Brapi. Nunca chega ao cliente. Ausência do token → erro `500` explícito.
- O cliente chama sempre caminhos relativos (`/api/assets/...`), nunca `https://brapi.dev` diretamente. `useAssetDetail` foi alinhado ao proxy (corrige o item 2.3).
- **Estratégia de dados/rate-limit em camadas**:
  - Cache local no Dexie (`assetCache`) com **TTL de 15 min**; histórico em `assetHistory` para sparklines (ver ADR-001).
  - Throttle de sync: só re-sincroniza ativos cujo `lastSync` seja > 1h (`investment-context.tsx`).
  - `AbortController` nas chamadas + fallback para cache expirado se a API falhar.
  - Eviction de cache antigo (24h para `assetCache`, 7d para `assetHistory`).
  - PWA (`next.config.mjs`): `runtimeCaching` de `/api/` como **NetworkFirst** (timeout 10s, TTL 15 min) — alinhado ao TTL do Dexie.

## Consequences

### Positive
- Token protegido no servidor; superfície de segurança reduzida.
- Ponto único para autenticação, timeout, tratamento de erro e formato de resposta (o handler já normaliza `{ prices }`).
- Rate-limit mitigado por múltiplas camadas de cache/throttle, reduzindo custo de cota.
- Comportamento consistente entre sync em lote e detalhe de ativo.
- Resiliência offline: NetworkFirst + fallback de cache no Dexie.

### Negative
- Introduz um componente **server-side** numa app que, para dados do usuário, é 100% client-side — exige deploy num ambiente que execute route handlers (ex.: Vercel/Node), não um host estático puro.
- Depende de disponibilidade e do modelo de cota da Brapi; sem fallback de provedor alternativo (oportunidade futura).
- `BRAPI_TOKEN` precisa ser provisionado no ambiente (e documentado em `.env.example` — ver checklist 1.3).

### Neutral
- Os TTLs (15 min / 1h / 24h / 7d) são parâmetros de negócio ajustáveis conforme o plano da Brapi e o padrão de uso.

## Links
- Implementação: `app/api/assets/{sync,detail,search}/route.ts`, `app/investimentos/hooks/useAssetDetail.ts`, `contexts/domains/investment-context.tsx`, `next.config.mjs`
- Origem da decisão: `docs/code-review-06-04.md` (itens 2.3, 3.3)
- Relacionado: [[ADR-001-indexeddb-dexie-persistencia-primaria]] (cache em `assetCache`/`assetHistory`)
