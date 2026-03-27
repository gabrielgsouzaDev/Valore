"use client"

import Link from "next/link"
import { DemoBanner } from "@/components/demo-banner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp, Wallet, Target, Receipt, CreditCard, LayoutDashboard,
  ArrowUpRight, ArrowDownRight, ChevronRight, Zap, Eye, EyeOff
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import NumberTicker from "@/components/ui/number-ticker"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { cn } from "@/lib/utils"
import {
  getEconomyBarColor,
  getGoalBarColor,
  getAssetBarColor,
  getDashboardEconomyColor,
  getDashboardGoalColor,
  getDashboardAssetColor
} from "@/lib/services"

export default function DashboardPage() {
  const {
    assets,
    totalNetWorth,
    categories,
    totalBudgeted,
    totalSpent,
    goals,
    transactions,
    calculateInvoices,
    getTotalCardDebt,
    settings,
    isPrivate,
    togglePrivacy
  } = useApp()

  const activeModules = settings.activeModules || {}
  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  const pct = (v: number, total: number) => total > 0 ? Math.round((v / total) * 100) : 0

  const totalCardDebt = getTotalCardDebt()
  const balance = totalBudgeted - totalSpent

  // Objetivo com maior progresso
  const topGoal = goals.length > 0
    ? [...goals].sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
    : null

  // Próximas transações pendentes nos próximos 30 dias
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in30 = new Date(today)
  in30.setDate(in30.getDate() + 30)

  const upcomingTransactions = transactions
    .filter((t) => {
      if (t.status !== "pendente") return false
      const d = new Date(t.dueDate)
      return d >= today && d <= in30
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  // Próxima fatura de cartão (30 dias)
  const allInvoices = calculateInvoices()
  const nextInvoice = allInvoices.find((inv) => {
    const d = new Date(inv.year, inv.monthIndex)
    return d >= today
  })

  return (
    <>
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-4 sm:px-8 py-4 sm:py-6 flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">Visão consolidada do seu patrimônio</p>
          </div>
          <button
            onClick={togglePrivacy}
            className={cn(
              "ml-auto p-2.5 rounded-2xl transition-all duration-500 flex items-center gap-2 group",
              isPrivate
                ? "bg-primary/10 text-primary shadow-inner ring-1 ring-primary/20"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            aria-label={isPrivate ? "Mostrar valores" : "Ocultar valores"}
          >
            {isPrivate ? (
              <>
                <EyeOff className="h-5 w-5 animate-pulse" />
                <span className="text-xs font-bold hidden sm:inline">Privado</span>
              </>
            ) : (
              <>
                <Eye className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold hidden sm:inline">Público</span>
              </>
            )}
          </button>
        </div>
      </header>
      <DemoBanner />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Patrimônio em destaque */}
        <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Patrimônio Total</p>
          <div className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">
            <NumberTicker value={totalNetWorth} currency isPrivate={isPrivate} />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">{assets.length} ativo{assets.length !== 1 ? "s" : ""} em carteira</p>
        </div>

        {/* Bento Grid layout - Densidade de Informação de Elite */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-auto">
          {/* Investimentos (Dashboard Hero) */}
          {(activeModules.investimentos !== false) && (
            <div className="md:col-span-2 md:row-span-2 order-1 group/bento">
              <ErrorBoundary moduleName="Card de Investimentos">
                <Link href="/investimentos" className="h-full block">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all duration-500 h-full flex flex-col group-hover/bento:shadow-[0_15px_30px_rgba(0,0,0,0.08)] group-hover/bento:-translate-y-1 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover/bento:bg-primary/10 transition-colors" />

                    <CardHeader className="pb-1 p-5 sm:p-6 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 group-hover/bento:scale-105 transition-transform duration-500">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm sm:text-base font-black text-foreground tracking-tighter italic uppercase">Patrimônio</CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
                          <ArrowUpRight className="h-3 w-3" />
                          +2.4%
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between relative">
                      <div className="mb-4">
                        <div className="text-3xl sm:text-5xl font-black text-primary tracking-tighter">
                          <NumberTicker value={totalNetWorth} currency isPrivate={isPrivate} />
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60 mt-1">
                          {assets.length} ATIVOS • ESTRATÉGIA {settings.investmentStrategy}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
                        <div>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase">Liquidez Imediata</p>
                          <div className={cn("text-sm font-bold text-foreground")}>
                            <NumberTicker value={totalNetWorth * 0.15} currency isPrivate={isPrivate} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-muted-foreground font-bold uppercase">Diversificação</p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-1 flex-1 rounded-full bg-primary/20" />)}
                            <div className="h-1 flex-1 rounded-full bg-primary/10" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            </div>
          )}

          {/* Economia (Dashboard Width) */}
          {(activeModules.economia !== false) && (
            <div className="md:col-span-2 order-2 group/bento">
              <ErrorBoundary moduleName="Card de Economia">
                <Link href="/economia" className="block h-full">
                  <Card className="bg-card border-border hover:border-success/40 transition-all duration-500 h-full group-hover:shadow-[0_15px_30px_rgba(34,197,94,0.05)] group-hover:-translate-y-1 relative overflow-hidden flex flex-col">
                    <CardHeader className="pb-1 p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-success/10 group-hover:scale-110 transition-transform duration-500">
                            <Wallet className="h-5 w-5 text-success" />
                          </div>
                          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">RESUMO MENSAL</CardTitle>
                        </div>
                        <span className="text-[10px] font-bold text-success px-2 py-0.5 bg-success/10 rounded-full tracking-widest uppercase">Saudável</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between pt-0 mt-3">
                      <div className="flex items-baseline gap-2 mb-4">
                        <div className="text-2xl sm:text-3xl font-black text-success tracking-tighter">
                          <NumberTicker value={totalSpent} currency isPrivate={isPrivate} />
                        </div>
                        <span className="text-xs text-muted-foreground font-bold opacity-40 uppercase tracking-widest">/ {fmt(totalBudgeted)}</span>
                      </div>

                      <div className="space-y-4">
                        <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden ring-1 ring-border/5">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(34,197,94,0.2)]"
                            style={{
                              width: `${Math.min(pct(totalSpent, totalBudgeted), 100)}%`,
                              backgroundColor: getEconomyBarColor(totalSpent, totalBudgeted)
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Reserva Emergência</p>
                            <div className="flex items-center gap-2">
                              <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-warning w-2/3 rounded-full" />
                              </div>
                              <span className="text-[10px] font-bold">66%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase">Saldo</p>
                            <div className={cn("text-xs font-bold", balance >= 0 ? "text-success" : "text-danger")}>
                              <NumberTicker value={balance} currency isPrivate={isPrivate} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            </div>
          )}

          {/* Objetivos & Recomendação (Lado a Lado ou Stacked conforme tela) */}
          <div className="md:col-span-1 order-3 space-y-4">
            {/* Objetivos */}
            {(activeModules.objetivos !== false) && (
              <ErrorBoundary moduleName="Card de Objetivos">
                <Link href="/objetivos" className="group block">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all">
                    <CardHeader className="p-4 sm:p-5 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm sm:text-base font-bold">Objetivos</CardTitle>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-1">
                      {topGoal ? (
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-foreground leading-tight truncate">{topGoal.name}</p>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(pct(topGoal.current, topGoal.target), 100)}%`,
                                backgroundColor: getDashboardGoalColor(goals)
                              }}
                            />
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">{pct(topGoal.current, topGoal.target)}% concluído</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{goals.length} metas ativas</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}

            {/* Aporte Recomendado (Mini) */}
            <ErrorBoundary moduleName="Card de Próximo Aporte">
              <Link href="/investimentos" className="group block">
                <Card className="bg-primary/5 border-primary/20 hover:border-primary/40 transition-all">
                  <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest mb-1">Próximo Aporte</p>
                      <div className="text-lg sm:text-xl font-extrabold text-primary">
                        <NumberTicker value={Math.max(balance, 0)} currency isPrivate={isPrivate} />
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </ErrorBoundary>
          </div>

          {/* Transações & Cartões (Row 3 ou Vertical Stack) */}
          <div className="md:col-span-1 order-4 space-y-4">
            {/* Cartões */}
            {(activeModules.cartoes !== false) && (
              <ErrorBoundary moduleName="Card de Cartões">
                <Link href="/cartoes" className="group block">
                  <Card className={cn(
                    "bg-card border-border hover:border-primary/40 transition-all",
                    totalCardDebt > 0 && "animate-pulse-critical border-danger/20"
                  )}>
                    <CardContent className="p-4 sm:p-5 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-3">
                        <CreditCard className="h-5 w-5 text-danger" />
                        <span className="text-[10px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full uppercase tracking-tight">Fatura Aberta</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-danger mb-1">
                        <NumberTicker value={totalCardDebt} currency isPrivate={isPrivate} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">Dívida consolidada</p>
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}

            {/* Transações (Mini Lista) */}
            {(activeModules.transacoes !== false) && (
              <ErrorBoundary moduleName="Card de Transações">
                <Link href="/transacoes" className="group block">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold flex items-center gap-2">
                          <Receipt className="h-3 w-3" /> Agenda
                        </h4>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="space-y-2">
                        {upcomingTransactions.slice(0, 2).map((t) => (
                          <div key={t.id} className="flex items-center justify-between gap-2 overflow-hidden">
                            <span className="text-[10px] font-medium text-muted-foreground truncate flex-1">{t.name}</span>
                            <span className={cn(
                              "text-[10px] font-bold",
                              t.type === "ganho" ? "text-success" : "text-danger",
                              isPrivate && "blur-sm select-none pointer-events-none opacity-40"
                            )}>
                              {fmt(t.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
