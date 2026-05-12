"use client"

/**
 * @file components/ui/skeleton-card.tsx
 * @description Componente genérico de Skeleton Screen para estados de carregamento.
 *
 * RESPONSABILIDADE VISUAL:
 * - Substitui conteúdo real durante queries assíncronas do Dexie/IndexedDB.
 * - Previne Layout Shift (CLS) ao manter as dimensões do conteúdo final.
 * - Animação pulse nativa via Tailwind (sem lib extra).
 *
 * VARIANTES:
 * - `summary` — Card de resumo financeiro (KPI card)
 * - `list-item` — Linha de lista (transações, metas, ativos)
 * - `chart` — Área de gráfico (Recharts placeholder)
 * - `full` — Ocupação total do container pai
 *
 * @example
 * // Enquanto dados do Dexie carregam:
 * const data = useLiveQuery(() => db.transactions.toArray())
 * if (!data) return <SkeletonCard variant="list-item" count={5} />
 */

import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

// ─── Props ────────────────────────────────────────────────────────────────────

interface SkeletonCardProps {
    /** Variante visual do skeleton. */
    variant?: "summary" | "list-item" | "chart" | "full"
    /** Número de repetições do skeleton (útil em listas). */
    count?: number
    /** Classes CSS adicionais para o container externo. */
    className?: string
}

// ─── Atoms de Skeleton ────────────────────────────────────────────────────────

/** Bloco opaco com animação pulse. */
function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
    return (
        <div className={cn("animate-pulse rounded-lg bg-muted/60", className)} style={style} />
    )
}

// ─── Variante: Summary Card (KPI) ─────────────────────────────────────────────

function SummarySkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
                <Bone className="h-3.5 w-24" />
                <Bone className="h-8 w-8 rounded-xl" />
            </div>
            <Bone className="h-7 w-36" />
            <Bone className="h-3 w-20" />
        </div>
    )
}

// ─── Variante: List Item ──────────────────────────────────────────────────────

function ListItemSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
            <Bone className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Bone className="h-3.5 w-3/5" />
                <Bone className="h-3 w-2/5" />
            </div>
            <Bone className="h-5 w-20" />
        </div>
    )
}

// ─── Variante: Chart ──────────────────────────────────────────────────────────

function ChartSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Bone className="h-4 w-32" />
                    <Bone className="h-3 w-20" />
                </div>
                <Bone className="h-8 w-24 rounded-xl" />
            </div>
            <div className="h-52 flex items-end gap-2">
                {[40, 65, 80, 55, 90, 70, 45, 85, 60, 75, 50, 95].map((h, i) => (
                    <Bone
                        key={i}
                        className="flex-1 rounded-t-lg"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Variante: Full ───────────────────────────────────────────────────────────

function FullSkeleton({ className }: { className?: string }) {
    return <Bone className={cn("w-full h-full min-h-[200px]", className)} />
}

// ─── Componente Principal ─────────────────────────────────────────────────────

/**
 * Skeleton genérico reutilizável para estados de carregamento assíncrono.
 *
 * @param variant - Visual do placeholder. Default: `"list-item"`.
 * @param count - Quantas repetições renderizar. Default: `1`.
 * @param className - Classes extras para o wrapper.
 */
export function SkeletonCard({ variant = "list-item", count = 1, className }: SkeletonCardProps) {
    const skeletonMap = {
        "summary": <SummarySkeleton />,
        "list-item": <ListItemSkeleton />,
        "chart": <ChartSkeleton />,
        "full": <FullSkeleton className={className} />,
    }

    const skeleton = skeletonMap[variant]

    if (count === 1) {
        return <div className={cn(className)}>{skeleton}</div>
    }

    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i}>{skeleton}</div>
            ))}
        </div>
    )
}
