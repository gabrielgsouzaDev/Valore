"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import NumberTicker from "@/components/ui/number-ticker"
import { cn } from "@/lib/utils"

interface SummaryCardsProps {
    income: number
    expenses: number
    balance: number
    activeTab: "agendadas" | "historico"
    isPrivate?: boolean
}

export function SummaryCards({ income, expenses, balance, activeTab, isPrivate = false }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <Card className="bg-card border-border border-l-4 border-l-success shadow-sm overflow-hidden group">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-success/10 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                {activeTab === "agendadas" ? "Entradas Previstas" : "Entradas Realizadas"}
                            </p>
                            <div className={cn("text-lg sm:text-2xl font-black text-success flex items-baseline gap-1", isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                <span className="text-sm font-bold opacity-60">R$</span>
                                <NumberTicker value={income} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border border-l-4 border-l-danger shadow-sm overflow-hidden group">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-danger/10 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-danger" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                {activeTab === "agendadas" ? "Saídas Previstas" : "Saídas Realizadas"}
                            </p>
                            <div className={cn("text-lg sm:text-2xl font-black text-danger flex items-baseline gap-1", isPrivate && "blur-md select-none pointer-events-none opacity-40")}>
                                <span className="text-sm font-bold opacity-60">R$</span>
                                <NumberTicker value={expenses} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border border-l-4 border-l-primary shadow-sm overflow-hidden group">
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform", balance >= 0 ? "bg-success/10" : "bg-danger/10")}>
                            <Calendar className={cn("h-5 w-5 sm:h-6 sm:w-6", balance >= 0 ? "text-success" : "text-danger")} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                {activeTab === "agendadas" ? "Saldo Projetado" : "Saldo do Período"}
                            </p>
                            <div className={cn("text-lg sm:text-2xl font-black flex items-baseline gap-1",
                                balance >= 0 ? "text-success" : "text-danger",
                                isPrivate && "blur-md select-none pointer-events-none opacity-40"
                            )}>
                                <span className="text-sm font-bold opacity-60">R$</span>
                                <NumberTicker value={balance} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
