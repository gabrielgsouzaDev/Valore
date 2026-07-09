"use client"

/**
 * CategoryCard.tsx
 *
 * Card individual de categoria de orçamento.
 *
 * Responsabilidades:
 *   1. Exibir nome, percentual do total, valor gasto vs orçado
 *   2. Barra de progresso animada com cor por status
 *   3. Top 2 subcategorias sempre visíveis (sem hover)
 *   4. Menu de ações estático via DropdownMenu
 *   5. Comunicar seleção ao CategoryGrid via onSelect
 *
 * Decisões de design:
 *   - Zero estado de hover com JS — CSS puro para efeitos visuais
 *   - Zero estado de expand inline — sheet gerenciado pelo CategoryGrid
 *   - isSelected indica visualmente que o sheet está aberto para este card
 */

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NumberTicker from "@/components/ui/number-ticker"
import { getBudgetStatus, getStatusColor } from "@/lib/utils/budget-status"
import { getCategoryColor } from "@/lib/category-colors"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

// ── Tipos ────────────────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: Category
  isPrivate: boolean
  isSelected: boolean
  onSelect: (category: Category) => void
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
}

// ── Componente Principal ─────────────────────────────────────────────────────

export function CategoryCard({
  category,
  isPrivate,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CategoryCardProps) {

  const status = getBudgetStatus(category.spent, category.budgeted)

  const percentage = category.budgeted > 0
    ? Math.round((category.spent / category.budgeted) * 100)
    : 0

  /*
   * topSubcategories — top 2 por valor gasto decrescente.
   * Sempre visíveis — não dependem de hover.
   */
  const topSubcategories = useMemo(() => {
    if (!category.subcategories?.length) return []
    return [...category.subcategories]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 2)
  }, [category.subcategories])

  const hasSubcategories = topSubcategories.length > 0
  const extraCount = (category.subcategories?.length ?? 0) - 2

  return (
    <Card
      onClick={() => onSelect(category)}
      className={cn(
        "relative bg-card/40 backdrop-blur-sm cursor-pointer",
        "transition-all duration-200",
        "shadow-sm hover:shadow-md",
        status.bg,
        status.border,
        status.level === "warning" && "border-2",
        status.level === "critical" && [
          "ring-1 ring-danger/5",
          "animate-pulse-subtle",
        ],
        isSelected && "ring-2 ring-primary/40 shadow-md",
      )}
    >
      <CardContent className="p-5 flex flex-col gap-3">

        {/* ── Linha 1: Nome + % Total + Menu ──────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">

          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <h3 className="text-sm font-black uppercase tracking-tighter text-foreground leading-none truncate flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(category.color) }} />
              <span className="truncate">{category.name}</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mt-1">
              {category.percentage}% do total
            </span>
          </div>

          {/*
           * DropdownMenu — sempre visível, sem estado JS de hover.
           * stopPropagation no trigger e nos itens para não
           * disparar onSelect ao interagir com o menu.
           */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-sm shrink-0",
                  "text-muted-foreground/50 hover:text-foreground",
                  "hover:bg-muted/50 transition-colors"
                )}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="sr-only">Ações de {category.name}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(category)
                }}
                className="text-xs font-bold cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(category)
                }}
                className="text-xs font-bold cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Editar Categoria
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(category.id)
                }}
                className="text-xs font-bold cursor-pointer text-danger focus:text-danger focus:bg-danger/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ── Linha 2: Valor Gasto + Orçado ───────────────────────────────── */}
        <div className="flex items-end gap-1.5">
          <NumberTicker
            value={category.spent}
            decimalPlaces={2}
            currency
            isPrivate={isPrivate}
            className="text-lg font-black tracking-tighter leading-none transition-colors"
          />
          <span className="text-[11px] font-bold text-muted-foreground/60 mb-0.5">
            / <NumberTicker
              value={category.budgeted}
              decimalPlaces={2}
              currency
              isPrivate={isPrivate}
              className="text-[11px] font-bold text-muted-foreground/60"
            />
          </span>
        </div>

        {/* ── Linha 3: Barra de Progresso + % ─────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full transition-colors duration-500"
              style={{ backgroundColor: getStatusColor(category.spent, category.budgeted) }}
            />
          </div>
          <span className={cn(
            "text-[11px] font-bold tabular-nums shrink-0",
            status.color
          )}>
            {percentage}%
          </span>
        </div>

        {/* ── Linha 4: Top 2 Subcategorias — sempre visíveis ──────────────── */}
        {hasSubcategories && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/20">
            {topSubcategories.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-[11px] font-bold text-muted-foreground truncate flex-1 leading-none">
                  {sub.name}
                </span>
                <NumberTicker
                  value={sub.spent}
                  decimalPlaces={2}
                  currency
                  isPrivate={isPrivate}
                  className="text-[11px] font-black text-foreground shrink-0 leading-none"
                />
              </div>
            ))}

            {/*
             * Indicador de mais itens — só aparece se houver
             * mais de 2 subcategorias. Semântica clara: convida
             * a abrir o sheet para ver todos.
             * Não usa stopPropagation pois o card inteiro já
             * chama onSelect — o comportamento é idêntico.
             */}
            {extraCount > 0 && (
              <span className={cn(
                "flex items-center gap-1 mt-0.5 w-fit",
                "text-[10px] font-black uppercase tracking-widest",
                "text-primary/50"
              )}>
                <ChevronRight className="h-2.5 w-2.5" />
                {extraCount} {extraCount === 1 ? "item" : "itens"} a mais
              </span>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  )
}