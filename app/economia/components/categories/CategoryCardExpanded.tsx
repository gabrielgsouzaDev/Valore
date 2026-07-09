"use client"

/**
 * CategoryCardExpanded.tsx
 *
 * Painel de detalhes de uma categoria — renderizado dentro do Sheet
 * lateral aberto pelo CategoryGrid ao selecionar um card.
 *
 * Responsabilidades:
 *   1. Header com nome, status e resumo financeiro da categoria
 *   2. Barra de progresso global da categoria (animada)
 *   3. Lista completa de subcategorias ordenadas por gasto
 *   4. Ações: editar categoria, excluir categoria, novo item
 *   5. Editar e excluir subcategorias individualmente
 *
 * Não gerencia estado de abertura — responsabilidade do CategoryGrid.
 */

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Pencil,
  Trash2,
  Plus,
} from "lucide-react"

import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/services"
import { getBudgetStatus, getStatusColor } from "@/lib/utils/budget-status"
import { cn } from "@/lib/utils"
import type { Category, Subcategory } from "@/lib/types"

// ── Tipos ────────────────────────────────────────────────────────────────────

interface CategoryCardExpandedProps {
  category: Category
  isPrivate: boolean
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
  onAddSubcategory: (categoryId: number) => void
  onEditSubcategory: (categoryId: number, subcategory: Subcategory) => void
  onDeleteSubcategory: (categoryId: number, subcategoryId: number) => void
}

// ── Componente Principal ─────────────────────────────────────────────────────

export function CategoryCardExpanded({
  category,
  isPrivate,
  onEdit,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: CategoryCardExpandedProps) {

  const status = getBudgetStatus(category.spent, category.budgeted)

  const percentage = category.budgeted > 0
    ? Math.round((category.spent / category.budgeted) * 100)
    : 0

  /*
   * allSubcategories — todas ordenadas por spent decrescente.
   * Preservado do BudgetCard original (allSubcategories useMemo).
   */
  const allSubcategories = useMemo(() => {
    if (!category.subcategories?.length) return []
    return [...category.subcategories].sort((a, b) => b.spent - a.spent)
  }, [category.subcategories])

  const hasSubcategories = allSubcategories.length > 0

  return (
    /*
     * flex flex-col h-full — ocupa toda a altura do SheetContent.
     * overflow-hidden no container raiz — o scroll acontece
     * apenas na lista de subcategorias, mantendo header e
     * footer sempre visíveis.
     */
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header do Sheet ───────────────────────────────────────────────── */}
      <SheetHeader className={cn(
        "px-6 py-5 shrink-0",
        "border-b border-border/50",
        status.bg,
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <SheetTitle className="text-base font-black uppercase tracking-tighter text-foreground leading-none truncate text-left">
              {category.name}
            </SheetTitle>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {category.percentage}% do orçamento total
            </span>
          </div>

          {/*
           * Badge de status — percentual gasto desta categoria.
           * Comunica severidade de forma compacta no header.
           */}
          <span className={cn(
            "shrink-0 text-[10px] font-black uppercase tracking-widest",
            "px-2.5 py-1 rounded-full border",
            status.color,
            status.border,
            status.bg,
          )}>
            {percentage}%
          </span>
        </div>
      </SheetHeader>

      {/* ── Resumo Financeiro ─────────────────────────────────────────────── */}
      <div className={cn(
        "px-6 py-5 shrink-0",
        "border-b border-border/30",
        "space-y-4"
      )}>

        {/* Valores: Gasto / Orçado */}
        <div className="flex items-end gap-2 tabular-nums">
          <span className={cn(
            "text-2xl font-black tracking-tighter leading-none",
            isPrivate && "blur-md select-none opacity-40"
          )}>
            {formatCurrency(category.spent)}
          </span>
          <span className="text-sm font-bold text-muted-foreground/60 mb-0.5">
            / {formatCurrency(category.budgeted)}
          </span>
        </div>

        {/* Barra de Progresso animada */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full transition-colors duration-500"
              style={{ backgroundColor: getStatusColor(category.spent, category.budgeted) }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              status.color
            )}>
              {percentage}% utilizado
            </span>
            <span className={cn(
              "text-[10px] font-bold text-muted-foreground uppercase tracking-widest",
              isPrivate && "blur-sm select-none opacity-40"
            )}>
              Restam {formatCurrency(category.budgeted - category.spent)}
            </span>
          </div>
        </div>

        {/* Ações da Categoria */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
            className={cn(
              "flex-1 h-8",
              "text-[10px] font-black uppercase tracking-widest",
              "border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30",
              "transition-all"
            )}
          >
            <Pencil className="h-3 w-3 mr-1.5" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(category.id)}
            className={cn(
              "h-8 w-8 shrink-0 p-0",
              "border-border/50 hover:bg-danger/10 hover:text-danger hover:border-danger/30",
              "transition-all"
            )}
          >
            <Trash2 className="h-3 w-3" />
            <span className="sr-only">Excluir {category.name}</span>
          </Button>
        </div>
      </div>

      {/* ── Lista de Subcategorias ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Título da seção */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Itens Detalhados
          </h4>
        </div>

        {/*
         * Área com scroll independente — header e footer ficam fixos.
         * overflow-y-auto aqui, overflow-hidden no container pai.
         */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {hasSubcategories ? (
            <div className="space-y-4">
              {allSubcategories.map((sub) => (
                <SubcategoryItem
                  key={sub.id}
                  sub={sub}
                  categoryId={category.id}
                  isPrivate={isPrivate}
                  onEdit={onEditSubcategory}
                  onDelete={onDeleteSubcategory}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-xs font-bold text-muted-foreground/60 mb-1">
                Nenhum item ainda
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                Adicione itens para detalhar esta categoria
              </span>
            </div>
          )}
        </div>

        {/* ── Footer: Novo Item ─────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-border/30 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddSubcategory(category.id)}
            className={cn(
              "w-full h-8",
              "text-[10px] font-black uppercase tracking-widest",
              "text-primary/70 hover:text-primary hover:bg-primary/5",
              "border border-dashed border-primary/20 hover:border-primary/40",
              "transition-all rounded-lg"
            )}
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Novo Item
          </Button>
        </div>

      </div>
    </div>
  )
}

// ── SubcategoryItem ───────────────────────────────────────────────────────────

/**
 * SubcategoryItem
 *
 * Item individual de subcategoria dentro do painel expandido.
 * Preserva toda a lógica visual do SubcategoryItem original do BudgetCard,
 * adicionando o botão de exclusão que existia no handler mas não na UI.
 */
function SubcategoryItem({
  sub,
  categoryId,
  isPrivate,
  onEdit,
  onDelete,
}: {
  sub: Subcategory
  categoryId: number
  isPrivate: boolean
  onEdit: (categoryId: number, subcategory: Subcategory) => void
  onDelete: (categoryId: number, subcategoryId: number) => void
}) {
  /*
   * subPercentage — quanto do orçado desta subcategoria foi gasto.
   * Preservado do SubcategoryItem original do BudgetCard.
   */
  const subPercentage = sub.budgeted > 0
    ? Math.round((sub.spent / sub.budgeted) * 100)
    : 0

  return (
    /*
     * group/item — padrão do BudgetCard original para revelar
     * botões de ação ao hover do item específico.
     */
    <div className="flex flex-col gap-1.5 group/item">

      {/* Linha: Nome + Valor + Ações */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-foreground truncate flex-1 leading-none">
          {sub.name}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {/*
           * Valor gasto — blur-sm (menor que o valor principal da categoria).
           * Preservado do SubcategoryItem original.
           */}
          <span className={cn(
            "text-xs font-black tabular-nums text-foreground leading-none",
            isPrivate && "blur-sm select-none opacity-40"
          )}>
            {formatCurrency(sub.spent)}
          </span>

          {/*
           * Botão editar — opacity-0 por padrão, visível no hover do item.
           * Padrão group/item preservado do SubcategoryItem original.
           */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(categoryId, sub)}
            className={cn(
              "h-6 w-6 rounded-sm shrink-0",
              "opacity-50 hover:opacity-100",
              "hover:bg-primary/10 hover:text-primary",
              "transition-all"
            )}
          >
            <Pencil className="h-3 w-3" />
            <span className="sr-only">Editar {sub.name}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(categoryId, sub.id)}
            className={cn(
              "h-6 w-6 rounded-sm shrink-0",
              "opacity-50 hover:opacity-100",
              "hover:bg-danger/10 hover:text-danger",
              "transition-all"
            )}
          >
            <Trash2 className="h-3 w-3" />
            <span className="sr-only">Excluir {sub.name}</span>
          </Button>
        </div>
      </div>

      {/* Barra de Progresso + Percentual */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 bg-muted/20 rounded-full overflow-hidden border border-border/5">
          {/*
           * Cores da barra preservadas do SubcategoryItem original:
           * ≥ 100% → bg-danger
           * ≥  80% → bg-warning
           *  < 80% → bg-primary/50
           */}
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(subPercentage, 100)}%`,
              backgroundColor: subPercentage >= 100
                ? 'var(--danger)'
                : subPercentage >= 80
                  ? 'var(--warning)'
                  : 'var(--primary)'
            }}
          />
        </div>

        {/*
         * Percentual — text-[10px] font-black preservado do original.
         * w-6 text-right para alinhar números de 1 a 3 dígitos.
         */}
        <span className="text-[10px] font-black text-muted-foreground/80 w-6 text-right tabular-nums leading-none">
          {subPercentage}%
        </span>
      </div>

    </div>
  )
}