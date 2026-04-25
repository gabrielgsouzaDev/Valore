/**
 * Mapa de cores de categoria (Economia).
 * As categorias guardam a cor como NOME (ex.: "emerald"); aqui traduzimos
 * para uma cor CSS real, usada no card e no seletor. Fonte única de verdade.
 */

export const CATEGORY_COLOR_OPTIONS: { value: string; label: string; hex: string }[] = [
    { value: "emerald", label: "Verde", hex: "#10b981" },
    { value: "cyan", label: "Ciano", hex: "#06b6d4" },
    { value: "blue", label: "Azul", hex: "#3b82f6" },
    { value: "violet", label: "Violeta", hex: "#8b5cf6" },
    { value: "amber", label: "Âmbar", hex: "#f59e0b" },
    { value: "orange", label: "Laranja", hex: "#f97316" },
    { value: "rose", label: "Rosa", hex: "#f43f5e" },
    { value: "red", label: "Vermelho", hex: "#ef4444" },
]

const COLOR_MAP: Record<string, string> = Object.fromEntries(
    CATEGORY_COLOR_OPTIONS.map((c) => [c.value, c.hex])
)

/** Retorna a cor CSS (hex) de uma categoria a partir do nome salvo. */
export function getCategoryColor(name?: string): string {
    return (name && COLOR_MAP[name]) || "#94a3b8" // fallback slate
}
