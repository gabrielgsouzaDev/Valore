"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  TrendingUp, Wallet, Settings, LayoutDashboard,
  CreditCard, MoreHorizontal, X, EyeOff, Eye, Calculator,
  PanelLeftClose, PanelLeftOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/app-context"

// Definição centralizada de todos os módulos
const ALL_MODULES = [
  { key: "dashboard", name: "Dashboard", href: "/", icon: LayoutDashboard, alwaysOn: true },
  { key: "investimentos", name: "Investimentos", href: "/investimentos", icon: TrendingUp },
  { key: "economia", name: "Economia", href: "/economia", icon: Wallet },
  { key: "cartoes", name: "Cartões", href: "/cartoes", icon: CreditCard },
]

// 4 slots fixos visíveis no bottom nav (não inclui dashboard que pode estar no "home" do nav)
const BOTTOM_NAV_FIXED_KEYS = ["dashboard", "investimentos", "economia", "cartoes"]

const openCalculator = () => document.dispatchEvent(new Event("open-calculator"))

export function Sidebar() {
  const pathname = usePathname()
  const { settings, togglePrivacy, isPrivate } = useApp()
  const activeModules = settings.activeModules || {}
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Colapso da sidebar desktop ──────────────────────────────────────────
  // A largura real é dirigida pela CSS var --sidebar-w (compartilhada com o
  // <main> em app-shell), então o layout acompanha sem prop-drilling. O estado
  // React controla só a visibilidade dos rótulos e o ícone do toggle.
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem("valore_sidebar_collapsed") === "1")
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("valore_sidebar_collapsed", next ? "1" : "0")
      document.documentElement.style.setProperty("--sidebar-w", next ? "5rem" : "16rem")
      return next
    })
  }

  // Filtra módulos visíveis
  const visibleModules = ALL_MODULES.filter(
    (m) => m.alwaysOn || activeModules[m.key] !== false
  )

  const hasDrawer = visibleModules.length > 5

  const bottomFixed = hasDrawer
    ? visibleModules.filter((m) => BOTTOM_NAV_FIXED_KEYS.includes(m.key))
    : visibleModules

  const drawerModules = hasDrawer
    ? visibleModules.filter((m) => !BOTTOM_NAV_FIXED_KEYS.includes(m.key))
    : []

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  const drawerHasActive = drawerModules.some((m) => isActive(m.href))

  // Classe compartilhada dos itens (nav + footer) no desktop, ciente do colapso.
  const deskItem = (active: boolean) => cn(
    "flex items-center rounded-xl transition-all text-sm font-semibold min-h-[44px] w-full",
    collapsed ? "justify-center px-0" : "gap-3 px-4",
    "py-3",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  )

  return (
    <>
      {/* ── DESKTOP SIDEBAR (lg+) ────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen lg:w-[var(--sidebar-w)] bg-card border-r border-border flex-col z-50 transition-[width] duration-300 overflow-hidden">
        <div className={cn(
          "border-b border-border p-4 flex items-center gap-2 min-h-[73px]",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link href="/" className="min-w-0 group">
              <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.14em] text-primary leading-none group-hover:opacity-80 transition-opacity">
                Valore
              </h1>
              <p className="font-display text-[10px] text-muted-foreground font-medium uppercase tracking-[0.25em] mt-1.5">
                Gestão Financeira
              </p>
            </Link>
          )}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="grid place-items-center h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {visibleModules.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={deskItem(active)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={togglePrivacy}
            title={collapsed ? (isPrivate ? "Privado" : "Público") : undefined}
            className={deskItem(isPrivate)}
          >
            {isPrivate ? <EyeOff className="h-5 w-5 flex-shrink-0" /> : <Eye className="h-5 w-5 flex-shrink-0" />}
            {!collapsed && <span className="truncate">{isPrivate ? "Privado" : "Público"}</span>}
          </button>

          <button
            onClick={openCalculator}
            title={collapsed ? "Calculadora" : undefined}
            className={deskItem(false)}
          >
            <Calculator className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Calculadora</span>}
          </button>

          <Link
            href="/configuracoes"
            title={collapsed ? "Configurações" : undefined}
            className={deskItem(pathname === "/configuracoes")}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Configurações</span>}
          </Link>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV (<lg) ────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-stretch">
          {bottomFixed.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-0.5 flex-1 min-w-0 transition-all",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn("grid place-items-center h-8 w-8 rounded-lg transition-all", active ? "bg-primary/15" : "bg-transparent")}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className="text-[9px] font-bold tracking-tight leading-none w-full text-center truncate">
                  {item.name === "Dashboard" ? "Início" : item.name}
                </span>
              </Link>
            )
          })}

          {hasDrawer && (
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-0.5 flex-1 min-w-0 transition-all",
                drawerHasActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("grid place-items-center h-8 w-8 rounded-lg transition-all", drawerHasActive ? "bg-primary/15" : "bg-transparent")}>
                <MoreHorizontal className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[9px] font-bold tracking-tight leading-none w-full text-center truncate">Mais</span>
            </button>
          )}

          {!hasDrawer && (
            <Link
              href="/configuracoes"
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-0.5 flex-1 min-w-0 transition-all",
                pathname === "/configuracoes" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("grid place-items-center h-8 w-8 rounded-lg transition-all", pathname === "/configuracoes" ? "bg-primary/15" : "bg-transparent")}>
                <Settings className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[9px] font-bold tracking-tight leading-none w-full text-center truncate">Ajustes</span>
            </Link>
          )}
        </div>
      </nav>

      {/* ── DRAWER "MAIS" ─────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-card border-t border-border rounded-t-3xl pb-safe animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="text-base font-bold text-foreground">Mais módulos</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pb-8 space-y-1">
              {drawerModules.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <div className={cn("p-2 rounded-xl", active ? "bg-primary/15" : "bg-muted")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-sm">{item.name}</span>
                  </Link>
                )
              })}

              <Link
                href="/configuracoes"
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all",
                  pathname === "/configuracoes"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <div className={cn("p-2 rounded-xl", pathname === "/configuracoes" ? "bg-primary/15" : "bg-muted")}>
                  <Settings className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">Configurações</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── CALCULADORA (FAB mobile, <lg) ──────────────────────────────
          Antes eram dois botões flutuantes sobre o header (privacidade +
          calculadora). A privacidade agora vive no PageHeader (ao lado dos
          números que ela oculta); a calculadora fica neste FAB, longe do topo. */}
      <button
        onClick={openCalculator}
        aria-label="Abrir Calculadora"
        title="Calculadora"
        className="lg:hidden fixed bottom-20 right-4 z-40 grid place-items-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 border border-primary/20 hover:scale-105 active:scale-95 transition-transform"
      >
        <Calculator className="h-5 w-5" />
      </button>
    </>
  )
}
