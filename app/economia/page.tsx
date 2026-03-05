"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/sidebar"
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil } from "lucide-react"
import { CategoryDialog } from "@/components/category-dialog"
import { SubcategoryDialog } from "@/components/subcategory-dialog"
import { useApp } from "@/contexts/app-context"
import type { Category, Subcategory } from "@/lib/types"

export default function EconomiaPage() {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleCategory,
    settings,
    totalBudgeted,
    totalSpent,
  } = useApp()

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: number
    subcategory: Subcategory | null
  } | null>(null)

  const remaining = totalBudgeted - totalSpent

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100
    if (percentage < 75) return "bg-emerald-500"
    if (percentage < 100) return "bg-yellow-500"
    return "bg-red-500"
  }

  const handleAddCategory = (categoryData: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => {
    addCategory(categoryData)
    setCategoryDialogOpen(false)
  }

  const handleEditCategory = (categoryData: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => {
    if (!editingCategory) return
    updateCategory(editingCategory.id, categoryData)
    setEditingCategory(null)
    setCategoryDialogOpen(false)
  }

  const handleDeleteCategory = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteCategory(id)
    }
  }

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryDialogOpen(true)
  }

  const openAddCategoryDialog = () => {
    setEditingCategory(null)
    setCategoryDialogOpen(true)
  }

  const handleAddSubcategory = (categoryId: number, subcategoryData: Omit<Subcategory, "id">) => {
    addSubcategory(categoryId, subcategoryData)
    setSubcategoryDialogOpen(false)
    setEditingSubcategory(null)
  }

  const handleEditSubcategory = (categoryId: number, subcategoryData: Omit<Subcategory, "id">) => {
    if (!editingSubcategory?.subcategory) return
    updateSubcategory(categoryId, editingSubcategory.subcategory.id, subcategoryData)
    setSubcategoryDialogOpen(false)
    setEditingSubcategory(null)
  }

  const handleDeleteSubcategory = (categoryId: number, subcategoryId: number) => {
    if (confirm("Tem certeza que deseja excluir esta subcategoria?")) {
      deleteSubcategory(categoryId, subcategoryId)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="lg:ml-64 transition-all duration-300 pt-20 lg:pt-0">
        <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
          <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col justify-center">
              <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Economia</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">
                Orçamento • Alocação de capital
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Income Card */}
              <Card className="bg-card border-border p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-4">Renda Mensal</h3>
                <p className="text-2xl sm:text-4xl font-bold text-primary">{formatCurrency(settings.rendaMensal)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Ajuste nas configurações</p>
              </Card>

              {/* Categories */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Categorias</h3>
                  <Button
                    onClick={openAddCategoryDialog}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Nova Categoria</span>
                    <span className="sm:hidden">Nova</span>
                  </Button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {categories.map((category) => (
                    <Card key={category.id} className="bg-card border-border overflow-hidden">
                      <div className="p-3 sm:p-5">
                        <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="text-muted-foreground hover:text-foreground flex-shrink-0"
                            >
                              {category.expanded ? (
                                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                              ) : (
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">
                                {category.name}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {category.percentage}% do orçamento
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="font-semibold text-foreground text-sm sm:text-base">
                                {formatCurrency(category.spent)}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                de {formatCurrency(category.budgeted)}
                              </p>
                            </div>
                            <div className="flex gap-0.5 sm:gap-1">
                              <Button
                                onClick={() => openEditCategoryDialog(category)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-accent"
                              >
                                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteCategory(category.id)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="sm:hidden mb-2 text-right">
                          <p className="font-semibold text-foreground text-sm">
                            {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                          </p>
                        </div>

                        <Progress
                          value={(category.spent / category.budgeted) * 100}
                          className="h-1.5 sm:h-2 bg-muted"
                          indicatorClassName={getProgressColor(category.spent, category.budgeted)}
                        />

                        {/* Subcategories */}
                        {category.expanded && (
                          <div className="mt-3 sm:mt-4 pl-4 sm:pl-8 space-y-2 sm:space-y-3 border-l-2 border-border">
                            {category.subcategories?.map((sub) => (
                              <div key={sub.id} className="space-y-1.5 sm:space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs sm:text-sm text-foreground/80 truncate">{sub.name}</p>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                      {formatCurrency(sub.spent)} / {formatCurrency(sub.budgeted)}
                                    </p>
                                    <Button
                                      onClick={() => {
                                        setEditingSubcategory({ categoryId: category.id, subcategory: sub })
                                        setSubcategoryDialogOpen(true)
                                      }}
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-accent"
                                    >
                                      <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteSubcategory(category.id, sub.id)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <Progress
                                  value={(sub.spent / sub.budgeted) * 100}
                                  className="h-1 bg-muted"
                                  indicatorClassName={getProgressColor(sub.spent, sub.budgeted)}
                                />
                              </div>
                            ))}
                            <Button
                              onClick={() => {
                                setEditingSubcategory({ categoryId: category.id, subcategory: null })
                                setSubcategoryDialogOpen(true)
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-accent hover:text-accent/80 text-xs h-7"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Subcategoria
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
                {/* Overview Card */}
                <Card className="bg-card border-border p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Resumo do Mês</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Orçado</span>
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          {formatCurrency(totalBudgeted)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Gasto</span>
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          {formatCurrency(totalSpent)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
                        <span className="text-xs sm:text-sm font-medium text-foreground/80">Restante</span>
                        <span
                          className="font-bold text-base sm:text-lg"
                          style={{ color: remaining >= 0 ? "rgb(52 211 153)" : "rgb(248 113 113)" }}
                        >
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>

                    <Progress
                      value={totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0}
                      className="h-2 sm:h-3 bg-muted"
                      indicatorClassName={getProgressColor(totalSpent, totalBudgeted)}
                    />

                    <p className="text-xs text-muted-foreground text-center">
                      {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : "0.0"}% utilizado
                    </p>
                  </div>
                </Card>

                {/* Fixed Expenses */}
                <Card className="bg-card border-border p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">Gastos Fixos</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {categories
                      .find((c) => c.name === "Moradia")
                      ?.subcategories?.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-foreground/80 truncate mr-2">{sub.name}</span>
                          <span className="font-semibold text-foreground text-sm flex-shrink-0">
                            {formatCurrency(sub.spent)}
                          </span>
                        </div>
                      ))}
                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
                      <span className="text-xs sm:text-sm font-medium text-foreground/80">Total</span>
                      <span className="font-bold text-primary text-sm sm:text-base">
                        {formatCurrency(categories.find((c) => c.name === "Moradia")?.spent || 0)}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSave={(data) => {
          if (editingCategory) {
            updateCategory(editingCategory.id, data)
            setEditingCategory(null)
          } else {
            addCategory(data)
          }
          setCategoryDialogOpen(false)
        }}
      />

      <SubcategoryDialog
        open={subcategoryDialogOpen}
        onOpenChange={setSubcategoryDialogOpen}
        subcategory={editingSubcategory?.subcategory || null}
        onSave={(data) => {
          if (editingSubcategory?.subcategory) {
            updateSubcategory(editingSubcategory.categoryId, editingSubcategory.subcategory.id, data)
          } else {
            addSubcategory(editingSubcategory?.categoryId || 0, data)
          }
          setSubcategoryDialogOpen(false)
          setEditingSubcategory(null)
        }}
      />
    </div>
  )
}
