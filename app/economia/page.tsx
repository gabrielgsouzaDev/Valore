"use client"

/**
 * page.tsx — Economia
 *
 * Responsabilidade única: composição.
 * Nenhuma lógica de negócio aqui — tudo delegado ao useEconomy.
 */

import { useEconomy } from "./hooks/useEconomy"

// Componentes Globais
import { DemoBanner } from "@/components/demo-banner"
import { CategoryDialog } from "@/components/category-dialog"
import { SubcategoryDialog } from "@/components/subcategory-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Wallet, Plus } from "lucide-react"

// Layout Local
import { EconomySidebar } from "./components/layout/EconomySidebar"

// Categorias
import { CategoryGrid } from "./components/categories/CategoryGrid"

export default function EconomiaPage() {
  const {
    // Dados
    categories,
    settings,
    isLoading,

    // Derivados do useBudgetSummary
    totalBudgeted,
    totalSpent,
    remaining,
    hasInvestmentsEnabled,

    // Estado dos diálogos
    categoryDialogOpen,
    setCategoryDialogOpen,
    editingCategory,
    subcategoryDialogOpen,
    setSubcategoryDialogOpen,
    editingSubcategory,
    confirmOpen,
    setConfirmOpen,

    // Handlers de categoria
    openAddCategoryDialog,
    openEditCategoryDialog,
    handleSaveCategory,
    handleDeleteCategory,

    // Handlers de subcategoria
    openAddSubcategoryDialog,
    openEditSubcategoryDialog,
    handleSaveSubcategory,
    handleDeleteSubcategory,

    // Confirmação
    handleConfirmDelete,
  } = useEconomy()

  const isPrivate = !!settings.isPrivate

  // ── Module Disabled Guard ──────────────────────────────────────────────────
  // Se o módulo economia está desativado nas configurações,
  // exibe uma view de módulo desativado ao invés do conteúdo.
  const isModuleDisabled = settings.activeModules?.economia === false

  if (isModuleDisabled) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-0">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tighter text-foreground">
              Módulo Desativado
            </h2>
            <p className="text-xs font-bold text-muted-foreground mt-1">
              O módulo Economia está desativado. Ative-o em Configurações {'>'} Módulos para acessar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Cabeçalho padronizado (PageHeader) — métrica-chave "Disponível" de cara */}
      <PageHeader
        icon={Wallet}
        title="Economia"
        metric={{ label: "Disponível", value: remaining, tone: remaining >= 0 ? "success" : "danger", isPrivate }}
      >
        <Button onClick={openAddCategoryDialog} size="sm" className="font-semibold">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Categoria</span>
        </Button>
      </PageHeader>

      <DemoBanner />

      <div className="flex flex-1 min-h-0">

        {/*
         * EconomySidebar — visível apenas em desktop (lg+)
         * Contém métricas, alertas e ações primárias.
         */}
        <ErrorBoundary moduleName="Economia (Sidebar)">
          <EconomySidebar
            remaining={remaining}
            totalBudgeted={totalBudgeted}
            totalSpent={totalSpent}
            isPrivate={isPrivate}
            categories={categories}
            onAddCategory={openAddCategoryDialog}
          />
        </ErrorBoundary>

        {/*
         * Conteúdo principal — scroll independente da sidebar.
         */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            <ErrorBoundary moduleName="Economia (Categorias)">
              <CategoryGrid
                categories={categories}
                isPrivate={isPrivate}
                isLoading={isLoading}
                onAddCategory={openAddCategoryDialog}
                onEditCategory={openEditCategoryDialog}
                onDeleteCategory={handleDeleteCategory}
                onAddSubcategory={openAddSubcategoryDialog}
                onEditSubcategory={openEditSubcategoryDialog}
                onDeleteSubcategory={handleDeleteSubcategory}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Criar / Editar Categoria */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      {/*
       * Criar / Editar Subcategoria
       * editingSubcategory.subcategory === null → modo criação
       * editingSubcategory.subcategory !== null → modo edição
       */}
      <SubcategoryDialog
        open={subcategoryDialogOpen}
        onOpenChange={setSubcategoryDialogOpen}
        subcategory={editingSubcategory?.subcategory ?? null}
        onSave={handleSaveSubcategory}
      />

      {/*
       * Confirmação de exclusão — usado tanto para categoria
       * quanto para subcategoria (deleteTarget discrimina internamente
       * no useCategoryActions — o page.tsx não precisa saber o tipo)
       */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir item"
        description="Esta ação não pode ser desfeita. Deseja realmente excluir este item?"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}