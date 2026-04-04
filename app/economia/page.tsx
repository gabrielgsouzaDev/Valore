"use client"

import { useEconomy } from "./hooks/useEconomy"
import { Card } from "@/components/ui/card"
import { DemoBanner } from "@/components/demo-banner"
import { CategoryDialog } from "@/components/category-dialog"
import { SubcategoryDialog } from "@/components/subcategory-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import NumberTicker from "@/components/ui/number-ticker"

// Subcomponêntes Locais
import { EconomyHeader } from "./components/EconomyHeader"
import { CategoryList } from "./components/CategoryList"
import { EconomySidebar } from "./components/EconomySidebar"

/**
 * Página de Economia (Budget/Categorias)
 * Segue o padrão de composição pura, delegando lógica de negócio para o hook useEconomy.
 */
export default function EconomiaPage() {
  const {
    categories,
    settings,
    totalBudgeted,
    totalSpent,
    remaining,
    fixedExpenses,
    fixedExpensesTotal,

    // Diálogos
    categoryDialogOpen, setCategoryDialogOpen,
    editingCategory,
    subcategoryDialogOpen, setSubcategoryDialogOpen,
    editingSubcategory,
    confirmOpen, setConfirmOpen,

    // Handlers
    openAddCategoryDialog,
    openEditCategoryDialog,
    handleSaveCategory,
    handleDeleteCategory,
    openAddSubcategoryDialog,
    openEditSubcategoryDialog,
    handleSaveSubcategory,
    handleDeleteSubcategory,
    handleConfirmDelete,
    toggleCategory,
  } = useEconomy()

  return (
    <>
      <EconomyHeader remaining={remaining} isPrivate={!!settings.isPrivate} />
      <DemoBanner />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Conteúdo Principal */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Card de Renda */}
            <Card className="bg-card border-border p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">Renda Mensal</h3>
              <div className="text-2xl sm:text-4xl font-bold text-primary">
                <NumberTicker value={settings.rendaMensal} currency isPrivate={!!settings.isPrivate} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Ajuste nas configurações</p>
            </Card>

            {/* Lista de Categorias */}
            <CategoryList
              categories={categories}
              isPrivate={!!settings.isPrivate}
              onAddCategory={openAddCategoryDialog}
              onEditCategory={openEditCategoryDialog}
              onDeleteCategory={handleDeleteCategory}
              onAddSubcategory={openAddSubcategoryDialog}
              onEditSubcategory={openEditSubcategoryDialog}
              onDeleteSubcategory={handleDeleteSubcategory}
              onToggleCategory={toggleCategory}
            />
          </div>

          {/* Sidebar de Resumo */}
          <EconomySidebar
            totalBudgeted={totalBudgeted}
            totalSpent={totalSpent}
            remaining={remaining}
            fixedExpenses={fixedExpenses}
            fixedExpensesTotal={fixedExpensesTotal}
            isPrivate={!!settings.isPrivate}
            hasInvestmentsEnabled={settings.activeModules?.investimentos !== false}
          />
        </div>
      </div>

      {/* Modais de Gerenciamento */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      <SubcategoryDialog
        open={subcategoryDialogOpen}
        onOpenChange={setSubcategoryDialogOpen}
        subcategory={editingSubcategory?.subcategory || null}
        onSave={handleSaveSubcategory}
      />

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
