"use client"

import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp, Wallet, Target, Receipt, CreditCard, LayoutDashboard,
  ArrowUpRight, ArrowDownRight, ChevronRight, Zap,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { cn } from "@/lib/utils"

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
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Patrimônio em destaque */}
          <div className="mb-6 p-4 sm:p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">Patrimônio Total</p>
            <p className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight">{fmt(totalNetWorth)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">{assets.length} ativo{assets.length !== 1 ? "s" : ""} em carteira</p>
          </div>

          {/* Grid de cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Investimentos */}
            {(activeModules.investimentos !== false) && (
              <ErrorBoundary moduleName="Card de Investimentos">
                <Link href="/app/investimentos" className="group">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all h-full">
                    <CardHeader className="pb-2 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Investimentos</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{fmt(totalNetWorth)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{assets.length} ativo{assets.length !== 1 ? "s" : ""}</p>
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}

            {/* Economia */}
            {(activeModules.economia !== false) && (
              <ErrorBoundary moduleName="Card de Economia">
                <Link href="/app/economia" className="group">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all h-full">
                    <CardHeader className="pb-2 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Economia</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xl sm:text-2xl font-bold text-foreground">{fmt(totalSpent)}</p>
                        <span className="text-xs text-muted-foreground">/ {fmt(totalBudgeted)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-all",
                            totalSpent > totalBudgeted ? "bg-danger" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(pct(totalSpent, totalBudgeted), 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{pct(totalSpent, totalBudgeted)}% do orçamento usado</p>
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}

            {/* Objetivos */}
            {(activeModules.objetivos !== false) && (
              <ErrorBoundary moduleName="Card de Objetivos">
                <Link href="/app/objetivos" className="group">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all h-full">
                    <CardHeader className="pb-2 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Objetivos</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                      {topGoal ? (
                        <>
                          <p className="text-sm font-semibold text-foreground truncate">{topGoal.name}</p>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                            <div
                              className={cn(
                                "h-1.5 rounded-full transition-all",
                                (() => {
                                  const monthsToTarget = (() => {
                                    const today = new Date()
                                    const target = new Date(topGoal.deadline)
                                    return Math.max(0, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()))
                                  })()
                                  const needed = monthsToTarget > 0 ? (topGoal.target - topGoal.current) / monthsToTarget : 0
                                  if (topGoal.current >= topGoal.target) return "bg-success"
                                  if (needed > topGoal.monthlyContribution) return "bg-danger"
                                  if (needed === topGoal.monthlyContribution && needed > 0) return "bg-warning"
                                  return "bg-primary"
                                })()
                              )}
                              style={{ width: `${Math.min(pct(topGoal.current, topGoal.target), 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {fmt(topGoal.current)} de {fmt(topGoal.target)} • {pct(topGoal.current, topGoal.target)}%
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">{goals.length} objetivo{goals.length !== 1 ? "s" : ""} ativo{goals.length !== 1 ? "s" : ""}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}

            {/* Transações */}
            {(activeModules.transacoes !== false) && (
              <ErrorBoundary moduleName="Card de Transações">
                <Link href="/app/transacoes" className="group">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all h-full">
                    <CardHeader className="pb-2 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-muted">
                            <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                          </div>
                          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Transações</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                      {upcomingTransactions.length > 0 ? (
                        <div className="space-y-1.5">
                          {upcomingTransactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground truncate">{t.name}</span>
                              <span className={`text-xs font-semibold flex-shrink-0 ${t.type === "ganho" ? "text-success" : "text-foreground"}`}>
                                {t.type === "ganho" ? "+" : "-"}{fmt(t.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Nenhuma transação nos próximos 30 dias</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}

            {/* Cartões */}
            {(activeModules.cartoes !== false) && (
              <ErrorBoundary moduleName="Card de Cartões">
                <Link href="/app/cartoes" className="group">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all h-full">
                    <CardHeader className="pb-2 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Cartões</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{fmt(totalCardDebt)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">dívida total em cartões</p>
                      {nextInvoice && (
                        <p className="text-xs text-muted-foreground mt-1.5">Próx. fatura: {fmt(nextInvoice.total)}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}

            {/* Aporte Recomendado */}
            {(activeModules.investimentos !== false) && (
              <ErrorBoundary moduleName="Card de Próximo Aporte">
                <Link href="/app/investimentos" className="group">
                  <Card className="bg-card border-border hover:border-primary/40 transition-all h-full">
                    <CardHeader className="pb-2 p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Próximo Aporte</CardTitle>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-0">
                      <p className="text-xl sm:text-2xl font-bold text-success">{fmt(Math.max(balance, 0))}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estratégia: <span className="capitalize text-foreground font-medium">{settings.investmentStrategy}</span>
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
