/**
 * Barrel re-export para compatibilidade retroativa.
 * Tipos reais estão organizados em lib/types/*.
 */
export type {
    Asset,
    AssetType,
    InvestmentStrategy,
    BankType,
} from "./types/core"
export type { Subcategory, Category, ScheduledTransaction } from "./types/budget"
export type { Bank, CreditCard, CardExpense, InvoiceProjection } from "./types/banking"
export type { Goal } from "./types/goals"
export type { Settings } from "./types/settings"
export type { MarketData, AssetCache, AssetHistoryItem, PatrimonialSnapshot } from "./types/market"
export type { ThemePreset } from "./types/theme"
export type { BackupImportData } from "./types/backup"
