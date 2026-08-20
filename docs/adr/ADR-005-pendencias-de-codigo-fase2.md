# ADR-005: Pendências de Código / Bugs (Auditoria Fase 2)

- **Status**: proposed
- **Date**: 2026-08-05
- **Deciders**: <preencher>
- **Tags**: bugs, débito-técnico, dependências, qualidade, código

> **Natureza deste ADR**: registro consolidado das pendências **de código** (bugs concretos, code smells, dependências) encontradas na auditoria da Fase 2 — itens com correção pontual, sem decisão estrutural. As pendências **arquiteturais** (com trade-offs de design) estão no [[ADR-004-pendencias-arquiteturais-fase2]].

## Context

Varredura da Fase 2 cobrindo: (1) bugs/erros/race conditions/segurança, (2) frontend/design, (3) backend/APIs, (4) dependências. Este ADR cataloga os achados de código com severidade e a **correção recomendada**, para servir de backlog rastreável.

## Decision

Corrigir os itens abaixo. Severidade: 🔴 alta · 🟡 média · ⚪ baixa.

### C. Bugs & correção de dados

| # | Sev | Achado | Local | Correção recomendada |
|---|-----|--------|-------|----------------------|
| C-1 | 🔴 | **Perda silenciosa de dados na migração**: se `appStorageSchema.safeParse` falha, `data=null`, as stores são **limpas**, a migração é **marcada como concluída** e retorna `success:true`. | `lib/migration.ts:160-258` | Não limpar antes de validar; abortar e preservar dados em falha; só marcar `IDB_VERSION_KEY` após verificação real (ver política em ADR-004/A-6). |
| C-2 | 🔴 | **Efeitos colaterais não revertidos**: excluir/editar transação paga não estorna `category.spent` nem `bank.balance` → valores inflam permanentemente. | `use-actions-extended.ts:79,86` | Efeito reversível único ou valores derivados (ver ADR-004/A-1). No mínimo: estornar em `deleteTransaction`/`updateTransaction`. |
| C-3 | 🟡 | **Auto-categorização OFX incorreta**: `findCategoryId` sempre prefere a categoria "alimentação/gastos essenciais" **independente** do grupo de palavras que casou → transporte/moradia/lazer viram alimentação. | `components/ofx-importer.tsx:108-127` | Reescrever para casar a categoria pelo grupo de keywords correspondente; remover o atalho fixo para "alimentação". |
| C-4 | 🟡 | **Código morto / plumbing frágil**: `categoriesSetterRef` + `setCategoriesRef` + `getCategoriesRefSetter` — singleton mutável de módulo passado a `useTransactionActions` e **nunca usado** (writes vão direto ao Dexie). | `contexts/domains/planning-context.tsx:44,84-88` | Remover o ref e o parâmetro `setCategoriesState` não utilizado. |
| C-5 | 🟡 | **`generateId` não concorrência-seguro** (`Math.max(ids)+1`), já `@deprecated`. | `lib/services/id-generator.ts` | Confirmar usos restantes (`grep generateId`) e migrar para `++id` nativo do Dexie usando o retorno de `.add()`. |
| C-6 | ⚪ | **`encodeURIComponent` ausente no servidor** na busca (cliente já codifica; falta defesa em profundidade). | `app/api/assets/search/route.ts:19` | Codificar/normalizar o param `q` no handler; validar formato. |

### D. Frontend / Design

| # | Sev | Achado | Local | Correção recomendada |
|---|-----|--------|-------|----------------------|
| D-1 | 🟡 | **Flash de tema errado**: script anti-flash cobre só 3 de 8 temas. | `app/layout.tsx:73-77` | Gerar presets a partir de `lib/theme-presets.ts` (ver ADR-004/A-5). |
| D-2 | 🟡 | **`ResponsiveDialog` subutilizado** (1 consumidor real); OFX importer e ~10 diálogos usam `Dialog` cru → sem drawer no mobile + duplicação. | `components/*-dialog.tsx`, `ofx-importer.tsx` | Migrar para `ResponsiveDialog` (ver ADR-004/A-4). |
| D-3 | ⚪ | **Formatação duplicada inline**: `new Intl.NumberFormat('pt-BR',{currency:'BRL'})` repetido em componentes em vez de `formatCurrency`. | `ofx-importer.tsx:230` e outros | Reusar `formatCurrency`/`formatDate` de `lib/services/calculations.ts`. |
| D-4 | ⚪ | **Acessibilidade**: `userScalable:false` + `maximumScale:1` bloqueiam zoom por pinça. | `app/layout.tsx:25` | Remover as restrições de zoom (WCAG 1.4.4). |
| D-5 | ⚪ | **`as any` difuso** em wrappers de gráficos e handlers de filtro → buracos de tipagem. | `lib/recharts-dynamic.ts`, `app/transacoes/components/TransactionHeader.tsx` | Tipar os wrappers do Recharts e os valores de filtro com uniões literais. |

### E. Backend / APIs

| # | Sev | Achado | Local | Correção recomendada |
|---|-----|--------|-------|----------------------|
| E-1 | 🟡 | **Proxy sem rate limit/validação** → risco de esgotar cota do token. | `app/api/assets/*` | Ver ADR-004/A-3 (decisão) — implementação: rate limit + Zod nos params. |
| E-2 | ⚪ | **Muitas transações Dexie independentes no import**: `handleImport` dispara N `addTransaction` em `forEach` sem `await`/batch (cada um abre sua própria transação). | `components/ofx-importer.tsx:103` | Agrupar num único `db.transaction`/`bulkAdd`; tratar erros por item. |
| E-3 | ⚪ | **Sem validação de entrada nas rotas** (query params não passam por schema). | `app/api/assets/*` | Validar com Zod na borda do route handler. |

> ✅ Pontos positivos confirmados: token **apenas server-side**; `try/catch` + status HTTP corretos nas rotas; `AbortController` e eviction de cache em `useAssetDetail`; transações Dexie atômicas nas actions CRUD; efeitos de `deleteBank`/`deleteCategory` já limpam referências.

### F. Dependências

| # | Sev | Achado | Correção recomendada |
|---|-----|--------|----------------------|
| F-1 | 🔴 | **Lint quebrado**: `package.json` tem `"lint":"eslint ."`, mas **`eslint` não está nas devDependencies** e **não há config de eslint**. O portão de qualidade não existe na prática. | Adicionar `eslint` + `eslint-config-next` e um `.eslintrc`/`eslint.config.mjs`; validar `npm run lint`. |
| F-2 | 🟡 | **`jspdf: "latest"`** — versão não fixada → build não-reprodutível / risco de supply chain; e `jspdf-autotable: 5.0.2` exige jspdf v3 (pode quebrar). | Fixar `jspdf` numa versão exata compatível com `jspdf-autotable@5`. |
| F-3 | 🟡 | **`@ducanh2912/next-pwa ^10.2.9`** — confirmar compatibilidade com **Next 16** (wrappers next-pwa costumam atrasar em majors do Next). | Validar em build de produção (PWA fica desabilitado em dev); avaliar alternativa se incompatível. |
| F-4 | ⚪ | **Majors envelhecendo**: `date-fns ^2.30` (v3/v4), `zod 3.25` (v4), `recharts 2.x` (v3). Sem urgência. | Planejar upgrades pontuais com testes. |
| F-5 | ⚪ | **`node_modules` ausente** → `npm outdated`/`npm audit` não puderam rodar nesta auditoria. | Rodar `npm install && npm outdated && npm audit` em CI e revisar. |
| F-6 | 🔴 | **`typescript.ignoreBuildErrors: true`** no `next.config.mjs` — o build ignora erros de tipo. | Rodar `tsc --noEmit`, corrigir erros e **remover** a flag para reativar a checagem. |

### G. Testes (pré-requisito para corrigir com segurança)
- 🔴 **Sem testes automatizados.** Antes de mexer em C-1/C-2, criar testes das funções puras de `lib/services/calculations.ts` (as 4 estratégias de aporte, `calculateInvoices` com fechamento no fim do mês, funções de cor). Stack sugerida: Vitest + RTL; adicionar script `test`.

## Consequences

### Positive
- Backlog de código rastreável, priorizado e com correção definida.
- Elimina dois bugs 🔴 de integridade/perda de dados e restaura o portão de lint/tipos.

### Negative
- Volume de itens exige sequenciamento; corrigir sem a rede de testes (G) arrisca regressões.

### Neutral
- Vários itens de código apontam para as decisões de ADR-004 — corrigir o sintoma sem a decisão pode reintroduzir o problema.

## Links
- Decisões arquiteturais correlatas: [[ADR-004-pendencias-arquiteturais-fase2]]
- Checklist operacional: `docs/checklist-organizacao.md`
- Revisão anterior (histórica): `docs/code-review-06-04.md`
