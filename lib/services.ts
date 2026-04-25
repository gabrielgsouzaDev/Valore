/**
 * Barrel re-export para compatibilidade retroativa.
 * Funções reais estão organizadas em lib/services/*.
 */
export { calculateInvoices } from "./services/calculations"
export {
    formatCurrency,
    calculateTotalNetWorth,
    calculateTotalBudgeted,
    calculateTotalSpent,
    calculateInvestmentDistribution,
    getEconomyBarColor,
    getAssetBarColor,
} from "./services/calculations"
export { migrateBackup } from "./services/migration"
