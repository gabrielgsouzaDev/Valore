# Valore

Painel de finanças pessoais e investimentos que roda inteiro no navegador. Reúne patrimônio, orçamento, cartões e carteira numa interface só, com sincronização de cotações da B3.

Não é uma corretora nem um app de banco. Os dados ficam no seu dispositivo (IndexedDB), não num servidor.

Status: PWA funcional, Next.js 16 com React 19, persistência reativa em IndexedDB, 22 testes nas regras de cálculo e arquitetura registrada em ADRs.

<!-- Adicione um print real da dashboard em docs/screenshot.png e descomente a linha abaixo. -->
<!-- ![Dashboard do Valore](docs/screenshot.png) -->

## O que resolve

- Ver o patrimônio consolidado (ativos e saldos bancários), a liquidez imediata, a composição da carteira e a evolução patrimonial numa dashboard, sem planilha.
- Decidir aportes: a partir de um valor, o app calcula onde alocar segundo 4 estratégias (rebalanceamento, proporcional, cascata e preço-teto).
- Acompanhar o orçamento por categoria e subcategoria, com um sinal de saúde por cor (verde, amarelo, vermelho) em cada categoria e no total.
- Controlar o crédito: vários cartões, projeção de faturas, parcelamentos e limite disponível.
- Manter tudo local: só as cotações saem do dispositivo, e passam por um proxy que esconde o token. Um modo privado borra os valores na tela.

## Como funciona (fluxo de dados)

A UI não trata o estado em memória como fonte de verdade. Ela observa o banco.

```
Ação do usuário  →  grava direto no IndexedDB (Dexie)
                          │
                     useLiveQuery detecta a mudança
                          │
        data-context → contextos de domínio → useApp()  →  UI re-renderiza
```

As cotações são o único dado que sai do dispositivo, e passam por um proxy no próprio Next.js:

```
Browser  →  /api/assets/sync?tickers=PETR4,VALE3  (route handler)
                 │  injeta BRAPI_TOKEN (no servidor)
                 ▼
            brapi.dev  →  { prices }  →  grava no Dexie + cache (TTL 15min)
```

O token nunca chega ao cliente. Um cache no Dexie e um throttle por ativo seguram a cota da API.

## Módulos

| Módulo | O que faz |
|--------|-----------|
| Dashboard | Patrimônio consolidado, liquidez imediata, composição da carteira e um card por módulo (investimentos, economia, cartões) com o indicador principal de cada um |
| Investimentos | CRUD de ativos (Ação, FII, ETF, Renda Fixa, Cripto), sincronização de preços via Brapi, 4 estratégias de aporte, distribuição por tipo e rentabilidade |
| Economia | Orçamento por categoria e subcategoria, orçado contra gasto, indicadores de saúde por faixa, cor por categoria |
| Cartões | Vários cartões, projeção de fatura, parcelamentos e limite disponível |
| Configurações | Bancos e contas, toggles de módulo, backup e restore (export/import JSON) e 33 temas (10 claros, 23 escuros) |

Há também uma calculadora acessível de qualquer tela (básica, juros compostos ou simples, e parcelamento).

O fluxo de registrar, calcular e visualizar funciona offline. As regras financeiras mais sensíveis (as 4 estratégias de aporte, a projeção de fatura e as faixas de saúde) são funções puras e têm testes.

## Rotas da API (proxy de cotações)

| Rota | Uso |
|------|-----|
| `GET /api/assets/sync?tickers=` | Cotações em lote (sincronização da carteira) |
| `GET /api/assets/detail?ticker=` | Detalhe e fundamentos de um ativo |
| `GET /api/assets/search?q=` | Busca de tickers ao cadastrar um ativo |

Todas exigem `BRAPI_TOKEN` no ambiente (lido no servidor) e respondem `500` sem ele.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Persistência | Dexie (IndexedDB) com `dexie-react-hooks` (`useLiveQuery`), reativa e offline-first |
| Estado | React Context dividido por domínio; TanStack Query para o cache do cliente |
| UI | Tailwind CSS 4, Radix UI (shadcn/ui), Framer Motion, Recharts |
| Validação | Zod (schemas de entidade e de backup) |
| PWA | `@ducanh2912/next-pwa` (Workbox), instalável e com cache offline do app-shell |
| Testes | Vitest |

## Decisões de arquitetura

As decisões estruturais estão registradas como ADRs, em [`docs/adr/`](docs/adr/):

- [ADR-001](docs/adr/ADR-001-indexeddb-dexie-persistencia-primaria.md): IndexedDB via Dexie como persistência primária e reativa, no lugar do localStorage antigo.
- [ADR-002](docs/adr/ADR-002-divisao-estado-por-dominios.md): estado dividido por domínios, encerrando o `AppContext` monolítico.
- [ADR-003](docs/adr/ADR-003-api-routes-proxy-cotacoes.md): API Routes do Next.js como proxy de cotações, para esconder o token e reduzir problemas de rate limit.
- [ADR-004](docs/adr/ADR-004-pendencias-arquiteturais-fase2.md) e [ADR-005](docs/adr/ADR-005-pendencias-de-codigo-fase2.md): pendências de arquitetura e de código anotadas para as próximas fases.

Uma visão geral da arquitetura atual está em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Começando (dev)

Pré-requisitos: Node 20 ou superior.

```bash
# 1. Instalar
npm install

# 2. Copiar o template de ambiente e preencher o token da Brapi
cp .env.example .env.local
#   BRAPI_TOKEN=...   (gratuito em https://brapi.dev/dashboard)

# 3. Rodar (http://localhost:3000)
npm run dev
```

Sem `BRAPI_TOKEN`, o app funciona normalmente. Só a sincronização de preços fica indisponível.

```bash
npm test          # 22 testes das regras de cálculo (Vitest)
npm run typecheck # checagem de tipos (tsc --noEmit)
npm run build     # build de produção
```

## Privacidade e segurança

- Os dados ficam no IndexedDB do navegador (ativos, cartões, orçamento e saldos). Nenhum backend os armazena.
- O `BRAPI_TOKEN` é lido só nos route handlers e não entra no bundle do cliente.
- A migração de schema passa por um Update Gate que exige backup antes de continuar.
- O modo privacidade borra os valores sensíveis na tela.

## Status e próximos passos

Já funciona: persistência reativa em IndexedDB, estado por domínio, proxy de cotações, PWA offline, 33 temas, backup e restore, e testes das funções de cálculo.

A fazer: ampliar os testes para além das funções de cálculo e adicionar rate limiting no proxy de cotações. Os detalhes estão nos ADRs [004](docs/adr/ADR-004-pendencias-arquiteturais-fase2.md) e [005](docs/adr/ADR-005-pendencias-de-codigo-fase2.md).

Projeto pessoal, usado como estudo de arquitetura offline-first e de regras financeiras testáveis.
