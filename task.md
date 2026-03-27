# Valore System Revamp: Plano de Execução

## 1. Infraestrutura Core e Proteção de Dados (Backend First)
- [x] **1.1. Implementar `safeSave` (app-context.tsx)**
  - [x] Debounce de salvamento para evitar gargalos durante edições rápidas.
  - [x] Envolver `localStorage.setItem` num try-catch.
  - [x] Passar o estado por `appStorageSchema.parse()` com Zod.
  - [x] Disparar Toast de erro caso a validação falhe e *bloquear* a gravação corrompida.
- [x] **1.2. Prevenir Dados Órfãos (Integridade Referencial)**
  - [x] Atualizar função `deleteCategory()`: Localizar transações afetadas e definir `categoryId: undefined`.
  - [x] Atualizar função `deleteCreditCard()`: Lidar com faturas. Logar ou avisar exclusão em cascata.
- [x] **1.3. Atualizar `types.ts`**
  - [x] Garantir que `activeModules` tenha tipagem forte para o Onboarding e Context.

## 2. Refatoração Visual Core e Design System (UI Base)
- [x] **2.1. Erradicar Cores Hardcoded**
  - [x] `app/cartoes/page.tsx`: Corrigir `text-emerald-400` para `text-success`.
  - [x] `app/cartoes/page.tsx`: Corrigir `bg-violet-500` para `bg-primary`/`bg-accent`.
- [x] **2.2. Implementar Drawers Responsivos (Bottom Sheets)**
  - [x] Identificar modais (`Dialog`) de criação de entidades.
  - [x] Adaptar para renderizar `Drawer` nativo no mobile (`<sm`) visando ergonomia no polegar, mantendo `Dialog` no Desktop.
- [x] **2.3. Blindagem contra "Double-Submission"**
  - [x] Injetar estado booleano `isSubmitting` nos botões de formulário principais.
  - [x] Mostrar ícone de `Spinner` (`lucide-react`) e desabilitar o botão enquanto salva.

## 3. Onboarding & Guided Education (UX Moderna)
- [x] **3.1. Redesign do Onboarding (`onboarding-wizard.tsx`)**
  - [x] Restringir modal para `max-w-md` (Mobile-first, focado).
  - [x] Passo 1 (Perfil): Input rápido de Nome.
  - [x] Passo 2 (Módulos): Lista de toggles (Switches) limpa.
  - [x] Passo 3 (Tema): Grid de preview em tempo-real.
- [x] **3.2. Sistema de Mini-Tutoriais (`ModuleGuide`)**
  - [x] Criar componente `ModuleGuide` com conteúdo contextual por rota.
  - [x] Garantir visibilidade imediata no reset de tour (Removido bloqueio em `/`).
  - [x] Implementar botão de ajuda flutuante para re-acionar o guia.
- [x] **3.3. Estabilização de Navegação**
  - [x] Corrigir `handleResetOnboarding` para usar `router.push("/")` e evitar perda de estado.

## 4. Arquitetura de Categorias Globais e Tela de Transações
- [x] **4.1. Refatoração da Tela de Transações (`app/transacoes/page.tsx`)**
  - [x] Support a ações (Editar/Excluir) em ambas as abas.
  - [x] Implementar `ResponsiveDialog` com suporte a `trigger`.
- [x] **4.2. Fluxo Desacoplado de Categorias**
  - [x] Botão "➕ Nova Categoria" direto no formulário de transação.
  - [x] Gestão central de categorias nas Configurações.

## 5. Auditoria de Estabilização (Finalizada)
- [x] Corrigir erros de compilação em `app/transacoes/page.tsx`.
- [x] Unificar gestão de categorias globais.
- [x] Sincronizar tipos e schemas de `Settings`.
- [x] Padronizar helpers de formatação (`formatDate`, `formatCurrency`) em `lib/services.ts`.
- [x] Garantir persistência segura via `safeSave` em todas as interações.
- [x] Validar responsividade e UX de todos os diálogos (`ResponsiveDialog`).
