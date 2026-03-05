"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  TrendingUp, Wallet, Target, Settings, LayoutDashboard,
  CreditCard, Receipt, MoreHorizontal, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/app-context"

// Definição centralizada de todos os módulos
const ALL_MODULES = [
  { key: "dashboard", name: "Dashboard", href: "/app", icon: LayoutDashboard, alwaysOn: true },
  { key: "investimentos", name: "Investimentos", href: "/app/investimentos", icon: TrendingUp },
  { key: "economia", name: "Economia", href: "/app/economia", icon: Wallet },
  { key: "objetivos", name: "Objetivos", href: "/app/objetivos", icon: Target },
  { key: "transacoes", name: "Transações", href: "/app/transacoes", icon: Receipt },
  { key: "cartoes", name: "Cartões", href: "/app/cartoes", icon: CreditCard },
]

// 4 slots fixos visíveis no bottom nav (não inclui dashboard que pode estar no "home" do nav)
const BOTTOM_NAV_FIXED_KEYS = ["dashboard", "investimentos", "economia", "cartoes"]

export function Sidebar() {
  const pathname = usePathname()
  const { settings } = useApp()
  const activeModules = settings.activeModules || {}
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Filtra módulos visíveis
  const visibleModules = ALL_MODULES.filter(
    (m) => m.alwaysOn || activeModules[m.key] !== false
  )

  // Se temos 5 ou menos módulos no total (incluindo dashboard e config), cabe tudo no bottom nav
  // Porém, adicionamos Configurações no drawer no código anterior, mas não estava no visibleModules.
  // visibleModules tem até 6 itens (dasboard + 5). 
  const hasDrawer = visibleModules.length > 5

  // Slots fixos do bottom nav
  const bottomFixed = hasDrawer
    ? visibleModules.filter((m) => BOTTOM_NAV_FIXED_KEYS.includes(m.key))
    : visibleModules

  // Módulos no drawer "Mais"
  const drawerModules = hasDrawer
    ? visibleModules.filter((m) => !BOTTOM_NAV_FIXED_KEYS.includes(m.key))
    : []

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(href + "/")

  const drawerHasActive = drawerModules.some((m) => isActive(m.href))

  return (
    <>
      {/* ── DESKTOP SIDEBAR (lg+) ────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col z-50">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-extrabold text-primary tracking-tighter">Valore</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-70">Mission Control</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleModules.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium min-h-[44px]",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/app/configuracoes"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium min-h-[44px]",
              pathname === "/app/configuracoes"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>Configurações</span>
          </Link>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV (<lg) ────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {bottomFixed.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[44px] min-h-[56px] flex-1",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn("p-1.5 rounded-lg transition-all", active ? "bg-primary/15" : "bg-transparent")}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn("text-[10px] font-semibold tracking-tight", active ? "text-primary" : "text-muted-foreground")}>
                  {item.name === "Dashboard" ? "Início" : item.name}
                </span>
              </Link>
            )
          })}

          {/* Botão "Mais" - só renderiza se hasDrawer for true */}
          {hasDrawer && (
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[44px] min-h-[56px] flex-1",
                drawerHasActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("p-1.5 rounded-lg transition-all", drawerHasActive ? "bg-primary/15" : "bg-transparent")}>
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <span className={cn("text-[10px] font-semibold tracking-tight", drawerHasActive ? "text-primary" : "text-muted-foreground")}>
                Mais
              </span>
            </button>
          )}

          {/* Configurações fica no navbar ou apenas no drawer?
              Originalmente config nao tava no menu inline. Se hasDrawer=false, config nao aparece unless added.
              Vamos adicionar Configurações no bottomFixed se !hasDrawer.
              Visão mobile max 5 items: Se hasDrawer for false, significa q visibleModules <= 5.
              Visiveis <= 5 => max 5 ícones na bottom bar (ex: inicio, invest, econ, cartoes, config? Nao, visibleModules nao inclui config).
              Vamos incluir config caso não haja drawer.
          */}
          {!hasDrawer && (
            <Link
              href="/app/configuracoes"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[44px] min-h-[56px] flex-1",
                pathname === "/app/configuracoes" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("p-1.5 rounded-lg transition-all", pathname === "/app/configuracoes" ? "bg-primary/15" : "bg-transparent")}>
                <Settings className="h-5 w-5" />
              </div>
              <span className={cn("text-[10px] font-semibold tracking-tight", pathname === "/app/configuracoes" ? "text-primary" : "text-muted-foreground")}>
                Ajustes
              </span>
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
                href="/app/configuracoes"
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all",
                  pathname === "/app/configuracoes"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <div className={cn("p-2 rounded-xl", pathname === "/app/configuracoes" ? "bg-primary/15" : "bg-muted")}>
                  <Settings className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">Configurações</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
