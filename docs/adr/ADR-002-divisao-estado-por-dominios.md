# ADR-002: Divisão de estado por domínios (fim do AppContext monolítico)

- **Status**: accepted
- **Date**: 2026-08-05
- **Deciders**: <preencher>
- **Tags**: estado, react-context, arquitetura, separação-de-responsabilidades

## Context

O estado global vivia num único `app-context.tsx` (~350 linhas) que concentrava: estado de todas as entidades, actions CRUD, sincronização com Dexie, valores computados, gestão de temas, snapshot patrimonial, sync de preços Brapi, backup/restore e fast-path cache.

Problemas observados (registrados na revisão `docs/code-review-06-04.md`, itens 2.5 e 3.2):

- **Violação sistêmica de responsabilidade única** — um bug em qualquer responsabilidade podia quebrar toda a árvore de componentes.
- **Re-renders amplos** — qualquer mudança no contexto propagava para todos os consumidores.
- **Baixa testabilidade e navegabilidade** — difícil isolar e evoluir uma área sem tocar no arquivo central.

## Decision

Quebrar o estado global em **providers de domínio** compostos, mantendo a interface pública (`useApp()`) estável para os componentes existentes.

- **`DataProvider`** (`contexts/domains/data-context.tsx`): camada de leitura reativa; expõe os dados live do Dexie (via `useLiveDb`) como fonte única para os demais.
- Providers de domínio, cada um dono do seu recorte de dados/actions/computados:
  - **`InvestmentProvider`** — ativos, patrimônio, snapshot, sync de preços.
  - **`BudgetProvider`** — categorias/subcategorias e orçamento.
  - **`BankingProvider`** — bancos, contas, itens vinculados.
  - **`PlanningProvider`** — metas/objetivos, transações.
  - **`CoreProvider`** — settings, temas, privacidade, backup/restore, reserva de emergência, fast-path cache, totais computados.
- **`AppProvider`** compõe a árvore: `DataProvider → (Budget → Investment → Banking → Planning → Core)`.
- **`useApp()`** faz o merge dos hooks de domínio (`useInvestment`, `useBudget`, `useBanking`, `usePlanning`, `useCore`) num único objeto memoizado, preservando o contrato `AppContextType` anterior — **os componentes não precisaram mudar**.
- As actions foram extraídas para `contexts/hooks/use-actions.ts` e `use-actions-extended.ts`, gravando direto no Dexie (ver ADR-001).

## Consequences

### Positive
- Responsabilidades isoladas por domínio — mais fácil localizar, testar e evoluir cada área.
- Re-renders mais contidos (combinado com a reatividade granular do `useLiveQuery`).
- Migração sem ruptura: a fachada `useApp()` manteve a API pública, permitindo refatorar internamente sem reescrever páginas.
- `app-context.tsx` caiu para ~187 linhas e virou apenas composição.

### Negative
- **Acoplamento indireto** — a ordem de aninhamento dos providers importa (ex.: `CoreProvider` recebe totais calculados a partir de `DataProvider`).
- Mais arquivos e uma camada de indireção a entender no onboarding.
- `useApp()` ainda agrega tudo; um consumidor que só precisa de um domínio poderia (futuramente) usar o hook específico para reduzir ainda mais re-renders.

### Neutral
- O padrão "fachada sobre domínios" é uma escolha deliberada para compatibilidade; pode ser afrouxada no futuro migrando componentes para hooks de domínio diretos.

## Links
- Implementação: `contexts/app-context.tsx`, `contexts/domains/*`, `contexts/hooks/use-actions*.ts`
- Origem da decisão: `docs/code-review-06-04.md` (itens 2.5, 3.2)
- Relacionado: [[ADR-001-indexeddb-dexie-persistencia-primaria]] (fonte de dados dos domínios)
