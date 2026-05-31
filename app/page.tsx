"use client"

import Link from "next/link"
import { useMemo } from "react"
import { DemoBanner } from "@/components/demo-banner"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp, TrendingDown, Wallet, CreditCard, LayoutDashboard,
  ArrowUpRight, ArrowDownRight, Activity, ArrowRight
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import NumberTicker from "@/components/ui/number-ticker"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { cn } from "@/lib/utils"
// Dynamic Recharts (Performance Rule #5) — types coerced via recharts-dynamic wrapper
import { ResponsiveContainer, AreaChart, Area } from "@/lib/recharts-dynamic"
import { formatCurrency, getEconomyBarColor } from "@/lib/services"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { PageHeader } from "@/components/ui/page-header"

/**
 * Paleta de distribuição — mesma usada no gráfico de Investimentos,
 * mantém coerência visual entre Dashboard e módulo.
 */
const DIST_COLORS = [
  "rgb(var(--theme-primary))",
  "rgb(var(--theme-success))",
  "rgb(var(--theme-warning))",
  "rgb(var(--theme-accent))",
  "rgb(var(--theme-danger))",
]

export default function DashboardPage() {
  const {
    assets,
    creditCards,
    totalNetWorth,
    totalBudgeted,
    totalSpent,
    getTotalCardDebt,
    getCardAvailableLimit,
    settings,
    isPrivate,
    patrimonialHistory,
    banks,
    isLoaded,
  } = useApp()

  const activeModules = settings.activeModules || {}
  const pct = (v: number, total: number) => (total > 0 ? Math.round((v / total) * 100) : 0)

  // ── Patrimônio / Liquidez (hero) ────────────────────────────────────────
  const totalCardDebt = getTotalCardDebt()
  const totalBanks = banks.reduce((acc, b) => acc + b.balance, 0)
  const totalLiquidityAssets = assets
    .filter((a) => a.type === "Renda Fixa")
    .reduce((acc, a) => acc + a.currentValue, 0)
  const immediateLiquidity = totalBanks + totalLiquidityAssets

  const sparklineData = patrimonialHistory.length > 1
    ? patrimonialHistory.slice(-7).map((s) => ({ value: s.totalNetWorth }))
    : Array.from({ length: 7 }).map(() => ({ value: totalNetWorth }))

  const patrimonialChange = patrimonialHistory.length > 1
    ? ((totalNetWorth - patrimonialHistory[patrimonialHistory.length - 2].totalNetWorth) /
        (patrimonialHistory[patrimonialHistory.length - 2].totalNetWorth || 1)) * 100
    : 0

  // ── Investimentos ───────────────────────────────────────────────────────
  const inv = useMemo(() => {
    const current = assets.reduce((a, x) => a + x.currentValue, 0)
    const cost = assets.reduce((a, x) => a + x.quantity * x.averagePrice, 0)
    const gain = current - cost
    const profit = cost > 0 ? (gain / cost) * 100 : 0

    const byType = new Map<string, number>()
    for (const a of assets) byType.set(a.type, (byType.get(a.type) ?? 0) + a.currentValue)
    const dist = Array.from(byType, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return { current, gain, profit, dist }
  }, [assets])

  // Base para a barra de composição (Investido + Caixa = Patrimônio).
  const patrimonioBase = inv.current + totalBanks

  // ── Economia ────────────────────────────────────────────────────────────
  const balance = totalBudgeted - totalSpent
  const economyPct = pct(totalSpent, totalBudgeted)

  // ── Cartões ─────────────────────────────────────────────────────────────
  const cards = useMemo(() => {
    const totalLimit = creditCards.reduce((a, c) => a + (c.limit ?? 0), 0)
    const available = creditCards.reduce((a, c) => a + getCardAvailableLimit(c.id), 0)
    const usage = totalLimit > 0 ? ((totalLimit - available) / totalLimit) * 100 : 0
    return { count: creditCards.length, totalLimit, available, usage }
  }, [creditCards, getCardAvailableLimit])

  return (
    <>
      <PageHeader icon={LayoutDashboard} title="Dashboard" />
      <DemoBanner />

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

        {/* ── HERO: Patrimônio Líquido (único) ───────────────────────────── */}
        {!isLoaded ? (
          <SkeletonCard variant="chart" className="h-[200px]" />
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm">
            {/* Sparkline de fundo */}
            <div className="absolute inset-y-0 right-0 w-full sm:w-2/3 opacity-[0.18] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="heroNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fill="url(#heroNetWorth)" isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="relative p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Patrimônio Líquido
                </p>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black tabular-nums",
                  patrimonialChange >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                )}>
                  {patrimonialChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {patrimonialChange >= 0 ? "+" : ""}{patrimonialChange.toFixed(1)}%
                </div>
              </div>

              <div className="text-4xl sm:text-6xl font-black text-primary tracking-tighter leading-none">
                <NumberTicker value={totalNetWorth} currency isPrivate={isPrivate} />
              </div>

              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" /> Tendência dos últimos 7 dias
              </p>

              {/* Composição do patrimônio — Investido vs Caixa (só %, sem repetir
                  os valores que já aparecem nos cards de módulo abaixo). */}
              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Composição
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Liquidez imediata {formatCurrency(immediateLiquidity)}
                  </span>
                </div>
                <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-muted">
                  <div className="bg-primary" style={{ width: `${pct(inv.current, patrimonioBase)}%` }} />
                  <div className="bg-success/70" style={{ width: `${pct(totalBanks, patrimonioBase)}%` }} />
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Investido <span className="text-foreground tabular-nums">{pct(inv.current, patrimonioBase)}%</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-success/70" />
                    Em caixa <span className="text-foreground tabular-nums">{pct(totalBanks, patrimonioBase)}%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MÓDULOS: 1 card por módulo, design próprio ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">

          {/* Investimentos — rentabilidade + distribuição */}
          {activeModules.investimentos !== false && (
            !isLoaded ? <SkeletonCard variant="chart" className="h-[260px]" /> : (
              <ErrorBoundary moduleName="Card de Investimentos">
                <ModuleCard
                  href="/investimentos"
                  icon={<TrendingUp className="h-5 w-5 text-primary" />}
                  iconBg="bg-primary/10"
                  title="Investimentos"
                  accent="hover:border-primary/40"
                  badge={
                    <span className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tabular-nums",
                      inv.gain >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                      {inv.gain >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {inv.gain >= 0 ? "+" : ""}{inv.profit.toFixed(1)}%
                    </span>
                  }
                >
                  <div className="mb-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Total em Ativos</p>
                    <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter">
                      <NumberTicker value={inv.current} currency isPrivate={isPrivate} />
                    </div>
                    <p className={cn("text-xs font-bold mt-1", inv.gain >= 0 ? "text-success" : "text-danger")}>
                      <span className={cn(isPrivate && "blur-sm select-none")}>
                        {inv.gain >= 0 ? "+" : ""}{formatCurrency(inv.gain)} de resultado
                      </span>
                    </p>
                  </div>

                  {/* Barra de distribuição por tipo */}
                  <div className="mt-auto pt-4">
                    {inv.dist.length > 0 ? (
                      <>
                        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-muted">
                          {inv.dist.map((d, i) => (
                            <div
                              key={d.name}
                              style={{
                                width: `${pct(d.value, inv.current)}%`,
                                backgroundColor: DIST_COLORS[i % DIST_COLORS.length],
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                          {inv.dist.slice(0, 3).map((d, i) => (
                            <span key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DIST_COLORS[i % DIST_COLORS.length] }} />
                              {d.name}
                              <span className="text-foreground tabular-nums">{pct(d.value, inv.current)}%</span>
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">Nenhum ativo cadastrado.</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-widest mt-3">
                      {assets.length} {assets.length === 1 ? "ativo" : "ativos"} • estratégia {settings.investmentStrategy}
                    </p>
                  </div>
                </ModuleCard>
              </ErrorBoundary>
            )
          )}

          {/* Economia — gasto vs orçado */}
          {activeModules.economia !== false && (
            !isLoaded ? <SkeletonCard variant="chart" className="h-[260px]" /> : (
              <ErrorBoundary moduleName="Card de Economia">
                <ModuleCard
                  href="/economia"
                  icon={<Wallet className="h-5 w-5 text-success" />}
                  iconBg="bg-success/10"
                  title="Economia"
                  accent="hover:border-success/40"
                  badge={
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      economyPct <= 100 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                      {economyPct <= 100 ? "Saudável" : "Estourou"}
                    </span>
                  }
                >
                  <div className="mb-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Gasto no Mês</p>
                    <div className="flex items-baseline gap-1.5">
                      <div className="text-2xl sm:text-3xl font-black text-success tracking-tighter">
                        <NumberTicker value={totalSpent} currency isPrivate={isPrivate} />
                      </div>
                      <span className={cn("text-xs text-muted-foreground font-bold", isPrivate && "blur-sm select-none")}>
                        / {formatCurrency(totalBudgeted)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 space-y-3">
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(economyPct, 100)}%`,
                          backgroundColor: getEconomyBarColor(totalSpent, totalBudgeted),
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Saldo Disponível</p>
                        <div className={cn("text-base font-black tracking-tight", balance >= 0 ? "text-success" : "text-danger")}>
                          <NumberTicker value={balance} currency isPrivate={isPrivate} />
                        </div>
                      </div>
                      <span className="text-2xl font-black tabular-nums text-muted-foreground/40">{economyPct}%</span>
                    </div>
                  </div>
                </ModuleCard>
              </ErrorBoundary>
            )
          )}

          {/* Cartões — fatura + uso do limite */}
          {activeModules.cartoes !== false && (
            !isLoaded ? <SkeletonCard variant="chart" className="h-[260px]" /> : (
              <ErrorBoundary moduleName="Card de Cartões">
                <ModuleCard
                  href="/cartoes"
                  icon={<CreditCard className="h-5 w-5 text-danger" />}
                  iconBg="bg-danger/10"
                  title="Cartões"
                  accent="hover:border-danger/40"
                  badge={
                    totalCardDebt > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-danger/10 text-danger">
                        Fatura Aberta
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-success/10 text-success">
                        Em Dia
                      </span>
                    )
                  }
                >
                  <div className="mb-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Fatura Consolidada</p>
                    <div className="text-2xl sm:text-3xl font-black text-danger tracking-tighter">
                      <NumberTicker value={totalCardDebt} currency isPrivate={isPrivate} />
                    </div>
                  </div>

                  <div className="mt-auto pt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        <span>Limite usado</span>
                        <span className="tabular-nums text-foreground">{cards.usage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-danger/70 transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(cards.usage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Limite Disponível</p>
                        <div className="text-base font-black text-foreground tracking-tight">
                          <NumberTicker value={cards.available} currency isPrivate={isPrivate} />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-widest">
                        {cards.count} {cards.count === 1 ? "cartão" : "cartões"}
                      </span>
                    </div>
                  </div>
                </ModuleCard>
              </ErrorBoundary>
            )
          )}
        </div>
      </div>
    </>
  )
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function ModuleCard({
  href, icon, iconBg, title, badge, accent, children,
}: {
  href: string
  icon: React.ReactNode
  iconBg: string
  title: string
  badge?: React.ReactNode
  accent: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className={cn(
        "bg-card border-border transition-all duration-300 h-full flex flex-col relative overflow-hidden",
        "group-hover:-translate-y-1 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.07)]",
        accent
      )}>
        <CardContent className="p-5 sm:p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105", iconBg)}>
                {icon}
              </div>
              <h3 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight truncate">{title}</h3>
            </div>
            {badge}
          </div>

          <div className="flex-1 flex flex-col">{children}</div>

          <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mt-4 group-hover:text-primary transition-colors">
            Abrir módulo <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
