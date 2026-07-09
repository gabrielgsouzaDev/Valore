"use client"

/**
 * EconomySidebar.tsx
 *
 * Sidebar fixa do módulo Economia — visível apenas em desktop (lg+).
 *
 * Responsabilidades:
 *   1. Disponível + barra de progresso global
 *   2. Métricas secundárias (renda, orçado, gasto)
 *   3. Alertas de categorias em warning/critical
 *   4. Ações primárias (nova categoria)
 */

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import NumberTicker from "@/components/ui/number-ticker"
import { getBudgetStatus, getStatusColor } from "@/lib/utils/budget-status"
import { getCategoryColor } from "@/lib/category-colors"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

// ── Tipos ────────────────────────────────────────────────────────────────────

interface EconomySidebarProps {
  remaining: number
  totalBudgeted: number
  totalSpent: number
  isPrivate: boolean
  categories: Category[]
  onAddCategory: () => void
}

// ── Componente Principal ─────────────────────────────────────────────────────

export function EconomySidebar({
  remaining,
  totalBudgeted,
  totalSpent,
  isPrivate,
  categories,
  onAddCategory,
}: EconomySidebarProps) {

  const percentage = totalBudgeted > 0
    ? Math.round((totalSpent / totalBudgeted) * 100)
    : 0

  const globalStatus = getBudgetStatus(totalSpent, totalBudgeted)

  const alertCategories = useMemo(() => {
    const priority: Record<string, number> = { critical: 0, warning: 1 }
    return categories
      .map((c) => ({ category: c, status: getBudgetStatus(c.spent, c.budgeted) }))
      .filter(({ status }) => status.level === "critical" || status.level === "warning")
      .sort((a, b) => (priority[a.status.level] ?? 2) - (priority[b.status.level] ?? 2))
  }, [categories])

  const hasAlerts = alertCategories.length > 0

  return (
    <aside className={cn(
      "hidden lg:flex flex-col",
      "w-60 shrink-0 h-full",
      "overflow-y-auto",
      "border-r border-border/50",
      "bg-card/20 backdrop-blur-sm",
      "px-4 py-6 gap-6"
    )}>

      {/* ── Disponível (detalhe — a identidade fica no PageHeader) ────────── */}
      <div className="space-y-3 px-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
          Disponível
        </span>
        <NumberTicker
          value={remaining}
          decimalPlaces={2}
          currency
          isPrivate={isPrivate}
          className={cn(
            "text-2xl font-black tracking-tighter block leading-none",
            remaining >= 0 ? "text-success" : "text-danger"
          )}
        />
        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full transition-colors duration-500"
              style={{ backgroundColor: getStatusColor(totalSpent, totalBudgeted) }}
            />
          </div>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            globalStatus.color
          )}>
            {percentage}% do orçamento utilizado
          </span>
        </div>
      </div>

      {/* ── Divisor ───────────────────────────────────────────────────────── */}
      <div className="h-px bg-border/40" />

      {/* ── 3. Métricas Secundárias ───────────────────────────────────────── */}
      <div className="space-y-1 px-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">
          Resumo do Mês
        </span>
        <SecondaryMetric
          label="Orçado"
          value={totalBudgeted}
          isPrivate={isPrivate}
        />
        <SecondaryMetric
          label="Gasto"
          value={totalSpent}
          isPrivate={isPrivate}
          valueClassName={globalStatus.color}
        />
      </div>

      {/* ── 4. Alertas ────────────────────────────────────────────────────── */}
      {hasAlerts && (
        <>
          <div className="h-px bg-border/40" />
          <div className="space-y-2 px-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">
              Em Atenção
            </span>
            <div className="space-y-1.5">
              {alertCategories.map(({ category, status }) => (
                <AlertItem
                  key={category.id}
                  category={category}
                  status={status}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── 5. Ações ──────────────────────────────────────────────────────── */}
      <div className="mt-auto space-y-2 px-1">
        <Button
          variant="outline"
          onClick={onAddCategory}
          className={cn(
            "w-full h-9",
            "font-black uppercase tracking-widest text-[10px]",
            "border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30",
            "transition-all"
          )}
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          Nova Categoria
        </Button>
      </div>

    </aside>
  )
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function SecondaryMetric({
  label,
  value,
  isPrivate,
  valueClassName,
}: {
  label: string
  value: number
  isPrivate: boolean
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs font-bold text-muted-foreground">
        {label}
      </span>
      <NumberTicker
        value={value}
        decimalPlaces={2}
        currency
        isPrivate={isPrivate}
        className={cn(
          "text-xs font-black text-foreground",
          valueClassName
        )}
      />
    </div>
  )
}

/*
 * AlertItem — isPrivate removido: o componente exibe apenas
 * nome e percentual, sem valores monetários que precisem de blur.
 */
function AlertItem({
  category,
  status,
}: {
  category: Category
  status: ReturnType<typeof getBudgetStatus>
}) {
  const percentage = category.budgeted > 0
    ? Math.round((category.spent / category.budgeted) * 100)
    : 0

  return (
    <div className={cn(
      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg",
      "border transition-colors",
      status.bg,
      status.border,
    )}>
      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(category.color) }} />
      <span className="text-[11px] font-bold text-foreground truncate flex-1 leading-none">
        {category.name}
      </span>
      <span className={cn(
        "text-[10px] font-black tabular-nums shrink-0",
        status.color
      )}>
        {percentage}%
      </span>
    </div>
  )
}