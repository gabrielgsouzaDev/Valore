"use client"

import { useApp } from "@/contexts/app-context"
import { themePresets } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

export function ThemeSelector() {
  const { settings, setTheme } = useApp()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Temas Disponíveis</h3>
      <div className="relative">
        <Button
          onClick={() => scroll("left")}
          variant="ghost"
          size="icon"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
          style={{ scrollBehavior: "smooth" }}
        >
          {themePresets.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium whitespace-nowrap ${settings.themeId === theme.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `rgb(${theme.colors.primary})` }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `rgb(${theme.colors.accent})` }} />
                </div>
                {theme.name}
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={() => scroll("right")}
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
