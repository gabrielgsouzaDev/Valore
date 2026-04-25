export type AssetType = "Ação" | "FII" | "ETF" | "Renda Fixa" | "Cripto" | "Outro"
export type InvestmentStrategy = "rebalance" | "proportional" | "waterfall" | "ceiling"
export type BankType = "conta_corrente" | "poupanca" | "carteira_digital" | "corretora" | "banco_digital" | "banco_tradicional" | "outro"

export type Asset = {
    id: number
    name: string
    ticker?: string
    syncAvailable?: boolean
    type: AssetType
    targetPercentage: number
    currentValue: number
    quantity: number
    price: number
    averagePrice: number
    annualDividend?: number
    bankId?: number
    ceilingPrice?: number
    priority?: number
    lastUpdated?: string
    lastSync?: string
}
