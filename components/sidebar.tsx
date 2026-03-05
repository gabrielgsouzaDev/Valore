"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { TrendingUp, Wallet, Target, Settings, CalendarClock, CreditCard, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/app-context"

const menuItems = [
  { name: "Investimentos", href: "/", icon: TrendingUp },
  { name: "Economia", href: "/economia", icon: Wallet },
  { name: "Objetivos", href: "/objetivos", icon: Target },
  { name: "Planejamento", href: "/planejamento", icon: CalendarClock },
  { name: "Cartões", href: "/cartoes", icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const { settings } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">{settings.nome}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Mission Control</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="p-3 sm:p-4 border-t border-border">
          <Link
            href="/configuracoes"
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base font-medium",
              pathname === "/configuracoes"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span>Configurações</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
