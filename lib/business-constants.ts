/**
 * VALORE BUSINESS LOGIC CONSTANTS
 * Centralized file for all hardcoded business rules and UI limits.
 */

export const BUSINESS_RULES = {
  // Projections
  INVOICE_PROJECTION_MONTHS: 12,
  CASH_FLOW_PROJECTION_DAYS: 30,

  // UI & UX
  SAVE_DEBOUNCE_MS: 500,
  MAX_MOBILE_NAV_ITEMS: 5,
  MAX_DRAWER_NAV_ITEMS: 4, // More menu appears after this

  // Finance
  DEFAULT_CURRENCY: "BRL",
  DEFAULT_LOCALE: "pt-BR",
  EMERGENCY_FUND_RECOMMENDED_MONTHS: 6,

  // Rebalance & Budgeting Thresholds
  REBALANCE_TOLERANCE: 0.01,
  BUDGET_WARNING_THRESHOLD: 0.8,
  BUDGET_DANGER_THRESHOLD: 1.0,
  BUDGET_TOLERANCE: 0.05,

  // Allocation Ratios for UI Colors
  ALLOCATION_RATIOS: {
    MIN_BALANCED: 0.95,
    MAX_BALANCED: 1.05,
    MIN_ACCEPTABLE: 0.80,
    MAX_ACCEPTABLE: 1.40,
  },

  // Assets & Transactions
  DUPLICATE_TRANSACTION_WINDOW_MS: 1000 * 60 * 60 * 24, // 1 day for hash comparison
  MAX_TRANSACTIONS_PER_PAGE: 50,

  // Security & Persistence
  LOCALSTORAGE_VERSION: 2,
  AUTO_SAVE_INTERVAL_MS: 3000,
} as const;

export const FORMAT_CONFIG = {
  DEFAULT_LOCALE: BUSINESS_RULES.DEFAULT_LOCALE,
  DEFAULT_CURRENCY: BUSINESS_RULES.DEFAULT_CURRENCY,
} as const;

export const STORAGE_CONFIG = {
  KEY: "valore_app_data_v2",
  VERSION: 3,
} as const;

export type BusinessRules = typeof BUSINESS_RULES;
