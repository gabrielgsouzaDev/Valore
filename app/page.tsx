"use client"

import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
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
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main className="lg:ml-64 transition-all duration-300 pb-20 lg:pb-0">
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

          {/* Bento Grid layout - Estrutura Assimétrica de Elite */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 auto-rows-[minmax(180px,auto)]">
            {/* Investimentos (Destaque Principal) */}
            {(activeModules.investimentos !== false) && (
              <div className="md:col-span-2 md:row-span-2 order-1 group/bento">
                <ErrorBoundary moduleName="Card de Investimentos">
                  <Link href="/investimentos" className="h-full block">
                    <Card className="bg-card border-border hover:border-primary/40 transition-all duration-500 h-full flex flex-col group-hover/bento:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover/bento:-translate-y-1 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/bento:bg-primary/10 transition-colors" />
                      <CardHeader className="pb-2 p-5 sm:p-6 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl relative overflow-hidden bg-primary/10 group-hover/bento:scale-110 transition-transform duration-500">
                              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 relative text-primary" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-black text-foreground tracking-tight italic">INVESTIMENTOS</CardTitle>
                          </div>
                          <div className="p-2 rounded-full bg-muted/20 opacity-0 group-hover/bento:opacity-100 transition-all duration-500">
                            <ChevronRight className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-end relative">
                        <div className="text-3xl sm:text-5xl font-black text-primary mb-3 tracking-tighter">
                          <NumberTicker value={totalNetWorth} currency isPrivate={isPrivate} />
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-widest opacity-70">
                          {assets.length} ATIVOS ESTRATÉGICOS
                          <span className="h-1 w-1 rounded-full bg-primary/40" />
                          {settings.investmentStrategy}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </ErrorBoundary>
              </div>
            )}

            {/* Economia (Médio-Largo) */}
            {(activeModules.economia !== false) && (
              <div className="md:col-span-2 order-2 group/bento">
                <ErrorBoundary moduleName="Card de Economia">
                  <Link href="/economia" className="block h-full">
                    <Card className="bg-card border-border hover:border-success/40 transition-all duration-500 h-full group-hover/bento:shadow-[0_20px_40px_rgba(34,197,94,0.05)] group-hover/bento:-translate-y-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover/bento:bg-success/10 transition-colors" />
                      <CardHeader className="pb-2 p-5 sm:p-6 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-success/10 group-hover/bento:scale-110 transition-transform duration-500">
                              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-tight">Fluxo de Caixa</CardTitle>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover/bento:text-success transition-colors" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 sm:p-6 pt-0 relative">
                        <div className="flex items-baseline gap-2 mb-4">
                          <div className="text-2xl sm:text-3xl font-black text-success tracking-tighter">
                            <NumberTicker value={totalSpent} currency isPrivate={isPrivate} />
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground font-bold opacity-50 uppercase tracking-widest">/ Orçamentos</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 mt-2 overflow-hidden ring-4 ring-background/50 relative">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                            style={{
                              width: `${Math.min(pct(totalSpent, totalBudgeted), 100)}%`,
                              backgroundColor: getEconomyBarColor(totalSpent, totalBudgeted)
                            }}
                          />
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-4 font-bold uppercase tracking-widest flex items-center justify-between opacity-70">
                          <span>EFICIÊNCIA DE GASTOS</span>
                          <span className="text-foreground">{pct(totalSpent, totalBudgeted)}%</span>
                        </p>
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
                              <span className={`text-[10px] font-bold ${t.type === "ganho" ? "text-success" : "text-danger"}`}>
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
      </main>
    </div>
  )
}
