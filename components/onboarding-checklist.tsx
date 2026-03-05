"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/app-context"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function OnboardingChecklist() {
    const { settings, banks, creditCards, assets, goals } = useApp()
    const [isVisible, setIsVisible] = useState(true)

    // O checklist só deve aparecer se o onboarding foi completado mas nem tudo está pronto
    // Ou se o usuário ainda não o descartou manualmente

    const tasks = [
        {
            id: "income",
            title: "Definir sua Renda Mensal",
            description: "Fundamental para o cálculo do seu orçamento.",
            isDone: settings.rendaMensal > 0,
            link: "/configuracoes"
        },
        {
            id: "bank",
            title: "Cadastrar sua primeira conta",
            description: "Conecte um banco para gerenciar seu saldo.",
            isDone: banks.length > 0 || creditCards.length > 0,
            link: "/configuracoes" // Onde se cadastra bancos no app atual? Geralmente configs ou tela de bancos
        },
        {
            id: "asset",
            title: "Adicionar seu primeiro ativo",
            description: "Comece a montar sua carteira de investimentos.",
            isDone: assets.length > 0,
            link: "/"
        },
        {
            id: "goal",
            title: "Criar um objetivo financeiro",
            description: "Defina metas como Reserva de Emergência.",
            isDone: goals.length > 0,
            link: "/objetivos"
        }
    ]

    const allDone = tasks.every(t => t.isDone)

    if (!settings.onboardingCompleted || !isVisible || allDone) return null

    return (
        <Card className="mb-6 border-primary/20 bg-primary/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Primeiros Passos
                        </h3>
                        <p className="text-sm text-muted-foreground">Complete as configurações básicas para extrair o máximo do Valore.</p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-muted-foreground hover:text-foreground p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tasks.map((task) => (
                        <Link
                            key={task.id}
                            href={task.link}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-xl border transition-all",
                                task.isDone
                                    ? "bg-muted/30 border-transparent opacity-60"
                                    : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                            )}
                        >
                            {task.isDone ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-semibold", task.isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                                    {task.title}
                                </p>
                                {!task.isDone && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
                            </div>
                            {!task.isDone && <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="h-1 w-full bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${(tasks.filter(t => t.isDone).length / tasks.length) * 100}%` }}
                />
            </div>
        </Card>
    )
}
