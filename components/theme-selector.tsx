"use client"

import { useApp } from "@/contexts/app-context"
import { themePresets } from "@/lib/constants"
import { Check, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const { settings, setTheme } = useApp()

  const darkThemes = themePresets.filter((t) => t.mode !== "light")
  const lightThemes = themePresets.filter((t) => t.mode === "light")

  const ThemeCard = ({ theme }: { theme: typeof themePresets[0] }) => {
    const isActive = settings.themeId === theme.id
    return (
      <button
        key={theme.id}
        onClick={() => setTheme(theme.id)}
        title={theme.description}
        className={cn(
          "relative flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all text-left hover:scale-[1.02] active:scale-[0.98]",
          isActive
            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
            : "border-border bg-card hover:border-primary/40"
        )}
      >
        {/* Preview de Cores */}
        <div
          className="w-full h-12 rounded-xl overflow-hidden flex"
          style={{ backgroundColor: `rgb(${theme.colors.background})` }}
        >
          <div className="flex-1 h-full" style={{ backgroundColor: `rgb(${theme.colors.card})` }} />
          <div className="w-1/3 h-full flex flex-col">
            <div className="flex-1" style={{ backgroundColor: `rgb(${theme.colors.primary})` }} />
            <div className="flex-1" style={{ backgroundColor: `rgb(${theme.colors.accent})` }} />
          </div>
        </div>

        {/* Nome */}
        <p className={cn(
          "text-xs font-semibold truncate",
          isActive ? "text-primary" : "text-foreground"
        )}>
          {theme.name}
        </p>

        {/* Check ativo */}
        {isActive && (
          <span className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
            <Check className="h-3 w-3" />
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-5">
      {/* Temas Escuros */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Moon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Escuros ({darkThemes.length})
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {darkThemes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </div>

      {/* Temas Claros */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sun className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Claros ({lightThemes.length})
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {lightThemes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  )
}
