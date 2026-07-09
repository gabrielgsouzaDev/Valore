"use client"

/**
 * CategoryGrid.tsx
 *
 * Grid estático de categorias de orçamento.
 *
 * Responsabilidades:
 *   1. Renderizar estados: loading → vazio → grid de cards
 *   2. Ordenar categorias por severidade (critical → warning → safe)
 *   3. Gerenciar qual categoria está selecionada para o sheet expandido
 *   4. Abrir CategoryCardExpanded como Sheet lateral ao clicar num card
 */

import React, { useMemo, useState, useCallback } from "react"
import { Wallet } from "lucide-react"

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { EmptyState } from "@/components/empty-state"
import { getBudgetStatus } from "@/lib/utils/budget-status"
import { cn } from "@/lib/utils"
import type { Category, Subcategory } from "@/lib/types"

import { CategoryCard } from "./CategoryCard"
import { CategoryCardExpanded } from "./CategoryCardExpanded"

// ── Tipos ────────────────────────────────────────────────────────────────────

interface CategoryGridProps {
  categories: Category[]
  isPrivate: boolean
  isLoading?: boolean
  onAddCategory: () => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (id: number) => void
  onAddSubcategory: (categoryId: number) => void
  onEditSubcategory: (categoryId: number, subcategory: Subcategory) => void
  onDeleteSubcategory: (categoryId: number, subcategoryId: number) => void
}

// ── Componente Principal ─────────────────────────────────────────────────────

export function CategoryGrid({
  categories,
  isPrivate,
  isLoading,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: CategoryGridProps) {

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleSelect = useCallback((cat: Category) => {
    setSelectedCategory(prev => prev?.id === cat.id ? null : cat)
  }, [])

  const handleEditFromSheet = useCallback((cat: Category) => {
    setSelectedCategory(null)
    onEditCategory(cat)
  }, [onEditCategory])

  const handleDeleteFromSheet = useCallback((id: number) => {
    setSelectedCategory(null)
    onDeleteCategory(id)
  }, [onDeleteCategory])

  const sortedCategories = useMemo(() => {
    const priority: Record<string, number> = { critical: 0, warning: 1, safe: 2 }
    return [...categories].sort((a, b) => {
      const statusA = getBudgetStatus(a.spent, a.budgeted)
      const statusB = getBudgetStatus(b.spent, b.budgeted)
      return (priority[statusA.level] ?? 2) - (priority[statusB.level] ?? 2)
    })
  }, [categories])

  // ── Estado: Loading ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[200px] bg-muted/20 animate-pulse rounded-[2rem] border border-border/50"
          />
        ))}
      </div>
    )
  }

  // ── Estado: Vazio ──────────────────────────────────────────────────────────

  if (categories.length === 0) {
    return (
      <div className="py-12 border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/5">
        <EmptyState
          icon={Wallet}
          title="Seu orçamento está vazio"
          description="Crie sua primeira categoria para começar a organizar suas despesas."
          actionLabel="Nova Categoria"
          onAction={onAddCategory}
        />
      </div>
    )
  }

  // ── Estado: Grid ───────────────────────────────────────────────────────────

  return (
    <>
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {sortedCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isPrivate={isPrivate}
            isSelected={selectedCategory?.id === category.id}
            onSelect={handleSelect}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
          />
        ))}
      </div>

      <Sheet
        open={selectedCategory !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCategory(null)
        }}
      >
        <SheetContent
          side="right"
          className="w-[400px] sm:w-[480px] p-0 flex flex-col"
        >
          {selectedCategory && (
            <CategoryCardExpanded
              category={selectedCategory}
              isPrivate={isPrivate}
              onEdit={handleEditFromSheet}
              onDelete={handleDeleteFromSheet}
              onAddSubcategory={onAddSubcategory}
              onEditSubcategory={onEditSubcategory}
              onDeleteSubcategory={onDeleteSubcategory}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}