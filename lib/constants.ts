import { themePresets } from "./theme-presets"
import { defaultSettings, exampleData } from "./example-data"
import { STORAGE_CONFIG } from "./business-constants"
 
export const CACHE_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '1'

export const CARD_COLOR_MAP = {
    violet: "#8b5cf6",
    orange: "#f97316",
    emerald: "#10b981",
    blue: "#2563eb",
    rose: "#f43f5e",
    cyan: "#06b6d4",
    amber: "#f59e0b",
    slate: "#64748b",
    zinc: "#3f3f46",
    indigo: "#4f46e5"
}

export { themePresets, defaultSettings, exampleData }

export const STORAGE_KEY = STORAGE_CONFIG.KEY

export const INTERFACE_LABELS = {
    TOTAL_NET_WORTH: "Patrimônio Total",
    IMMEDIATE_LIQUIDITY: "Liquidez Imediata",
    MONTHLY_INCOME: "Renda Mensal",
    MONTHLY_EXPENSES: "Saídas do Mês",
    INVESTED_CAPITAL: "Capital Investido",
    CURRENT_EQUITY: "Patrimônio Atual",
    YIELD_ON_COST: "Yield on Cost",
    BEST_DAY_TO_BUY: "Melhor Dia",
}
