"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import NumberTicker from "@/components/ui/number-ticker"
import { useApp } from "@/contexts/app-context"
import { cn } from "@/lib/utils"

type MetricTone = "default" | "success" | "danger" | "primary"

const toneClass: Record<MetricTone, string> = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-danger",
    primary: "text-primary",
}

interface PageHeaderProps {
    /** Ícone do módulo (Lucide). */
    icon: LucideIcon
    /** Título do módulo — fonte display (Oswald). */
    title: string
    /**
     * Métrica-chave do módulo, exibida "de cara" no header (padrão Economia).
     * Rótulo curto + valor em monospace tabular. Mantém o header limpo — 1 número só.
     */
    metric?: {
        label: string
        value: number
        tone?: MetricTone
        currency?: boolean
        isPrivate?: boolean
    }
    /** Ações do lado direito (botões, filtros). */
    children?: ReactNode
}

/**
 * Cabeçalho de página padronizado (Vintage Ledger).
 * Ícone "selo" + título em grotesca condensada + métrica-chave opcional + ações.
 * Fonte única de verdade para o topo de todos os módulos.
 *
 * No mobile o toggle de privacidade (olho) vive AQUI, ao lado dos números que
 * ele oculta — antes era um botão flutuante que cobria a métrica. No desktop o
 * mesmo controle já existe na sidebar, então o botão do header é `lg:hidden`.
 */
export function PageHeader({ icon: Icon, title, metric, children }: PageHeaderProps) {
    const { togglePrivacy, isPrivate } = useApp()

    return (
        <header className="border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-theme">
            <div className="px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-5">
                {/* Identidade */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="grid place-items-center h-8 w-8 sm:h-9 sm:w-9 rounded-md bg-primary/10 text-primary border border-primary/15 shrink-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <h1 className="font-display text-base sm:text-2xl font-bold uppercase tracking-wide text-foreground leading-none truncate">
                        {title}
                    </h1>
                </div>

                {/* Métrica-chave + privacidade (mobile) + ações */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {metric && (
                        <div className="text-right leading-none">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 leading-none">
                                {metric.label}
                            </span>
                            <NumberTicker
                                value={metric.value}
                                currency={metric.currency ?? true}
                                isPrivate={metric.isPrivate}
                                className={cn("text-sm sm:text-xl font-bold leading-none", toneClass[metric.tone ?? "default"])}
                            />
                        </div>
                    )}

                    {/* Toggle de privacidade — só mobile (desktop tem na sidebar) */}
                    <button
                        onClick={togglePrivacy}
                        aria-label={isPrivate ? "Mostrar valores" : "Ocultar valores"}
                        title={isPrivate ? "Mostrar valores" : "Ocultar valores"}
                        className={cn(
                            "lg:hidden grid place-items-center h-9 w-9 shrink-0 rounded-lg border transition-colors",
                            isPrivate
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                        )}
                    >
                        {isPrivate ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>

                    {children && <div className="flex items-center gap-2">{children}</div>}
                </div>
            </div>
        </header>
    )
}
