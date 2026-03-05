"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { TrendingUp, Wallet, Target, Settings, CalendarClock, CreditCard, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/app-context"

// Os 5 itens do bottom nav (limite de visibilidade mobile)
const navItems = [
  { name: "Invest.", href: "/", icon: TrendingUp },
  { name: "Economia", href: "/economia", icon: Wallet },
  { name: "Objetivos", href: "/objetivos", icon: Target },
  { name: "Cartões", href: "/cartoes", icon: CreditCard },
  { name: "Config.", href: "/configuracoes", icon: Settings },
]

// Itens apenas do menu lateral desktop (inclui Planejamento)
const sidebarItems = [
  { name: "Investimentos", href: "/", icon: TrendingUp },
  { name: "Economia", href: "/economia", icon: Wallet },
  { name: "Objetivos", href: "/objetivos", icon: Target },
  { name: "Planejamento", href: "/planejamento", icon: CalendarClock },
  { name: "Cartões", href: "/cartoes", icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const { settings } = useApp()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* ── DESKTOP SIDEBAR (lg+) ────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-extrabold text-primary tracking-tighter">Valore</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-70">Mission Control</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium min-h-[44px]",
                  isActive
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

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <Link
            href="/configuracoes"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium min-h-[44px]",
              pathname === "/configuracoes"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>Configurações</span>
          </Link>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV (< lg) ────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[44px] min-h-[56px] flex-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive ? "bg-primary/15" : "bg-transparent"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-semibold tracking-tight",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer placeholder para Planejamento que não aparece no bottom nav mobile */}
    </>
  )
}
