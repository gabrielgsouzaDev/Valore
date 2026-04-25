import { BUSINESS_RULES, FORMAT_CONFIG } from "@/lib/business-constants"
import type {
    Asset,
    Bank,
    CardExpense,
    Category,
    CreditCard,
    InvestmentStrategy,
    InvoiceProjection,
} from "@/lib/types"
import { addMonths, format, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Formata valor para centavos (2 casas decimais) com arredondamento seguro.
 * Evita drift de ponto flutuante em operações monetárias.
 */
function toCents(value: number): number {
    return Math.round(value * 100) / 100
}

/**
 * Calcula a projeção de faturas de cartão de crédito para os próximos 12 meses.
 *
 * @param expenses Lista de despesas de cartão
 * @param cards Lista de cartões de crédito
 * @param cardId Opcional: ID do cartão específico
 * @returns Array de projeções por mês (valores arredondados para centavos)
 *
 * @remarks
 * Utiliza `toCents` para evitar drift de ponto flutuante nas divisões de parcelas.
 * Ex: R$ 100,00 / 3 = R$ 33,33 × 3 = R$ 99,99 (perda de R$ 0,01)
 * A correção arredonda cada parcela para centavos antes de acumular.
 */
export function calculateInvoices(
    expenses: CardExpense[],
    cards: CreditCard[],
    cardId?: number
): InvoiceProjection[] {
    const projections: InvoiceProjection[] = []
    const today = new Date()

    for (let i = 0; i < BUSINESS_RULES.INVOICE_PROJECTION_MONTHS; i++) {
        const projectionDate = addMonths(startOfMonth(today), i)
        const monthName = format(projectionDate, "MMMM", { locale: ptBR })
        const year = projectionDate.getFullYear()

        const monthlyExpenses: { description: string; amount: number; installment: string; cardId: number }[] = []
        let monthlyTotal = 0

        expenses.forEach((expense) => {
            if (cardId && expense.cardId !== cardId) return

            const card = cards.find((c) => c.id === expense.cardId)
            if (!card) return

            const purchaseDate = new Date(expense.purchaseDate)
            const closingDay = card.closingDay

            let firstInvoiceDate = startOfMonth(purchaseDate)
            if (purchaseDate.getDate() > closingDay) {
                firstInvoiceDate = addMonths(firstInvoiceDate, 1)
            }

            const monthsSinceFirstInvoice =
                (projectionDate.getFullYear() - firstInvoiceDate.getFullYear()) * 12 +
                (projectionDate.getMonth() - firstInvoiceDate.getMonth())

            const currentPaidInstallments = expense.paidInstallments || 0
            const actualInstallmentIndex = monthsSinceFirstInvoice + currentPaidInstallments

            if (actualInstallmentIndex >= 0 && actualInstallmentIndex < expense.installments) {
                const installmentAmount = toCents(expense.totalAmount / expense.installments)
                monthlyTotal = toCents(monthlyTotal + installmentAmount)
                monthlyExpenses.push({
                    description: expense.description,
                    amount: installmentAmount,
                    installment: `${actualInstallmentIndex + 1}/${expense.installments}`,
                    cardId: expense.cardId,
                })
            }
        })

        projections.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            year,
            monthIndex: projectionDate.getMonth(),
            total: monthlyTotal,
            expenses: monthlyExpenses,
        })
    }

    return projections
}

/** Formata um valor numérico para moeda brasileira (BRL). */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat(FORMAT_CONFIG.DEFAULT_LOCALE, {
        style: "currency",
        currency: FORMAT_CONFIG.DEFAULT_CURRENCY,
    }).format(value)
}

/** Calcula o patrimônio total somando ativos e saldos bancários. */
export function calculateTotalNetWorth(assets: Asset[], banks: Bank[] = []): number {
    const assetsTotal = assets.reduce((sum, asset) => sum + asset.currentValue, 0)
    const banksTotal = banks.reduce((sum, bank) => sum + bank.balance, 0)
    return assetsTotal + banksTotal
}

/** Calcula o total orçado de uma lista de categorias. */
export function calculateTotalBudgeted(categories: Category[]): number {
    return categories.reduce((sum, cat) => sum + cat.budgeted, 0)
}

/** Calcula o total gasto de uma lista de categorias. */
export function calculateTotalSpent(categories: Category[]): number {
    return categories.reduce((sum, cat) => sum + cat.spent, 0)
}

/** Calcula a distribuição de um aporte entre ativos com base na estratégia. */
export function calculateInvestmentDistribution(
    amount: number,
    assets: Asset[],
    totalNetWorth: number,
    strategy: InvestmentStrategy = "rebalance"
): { name: string; amount: number }[] {
    if (isNaN(amount) || amount <= 0) return []

    let recs: { name: string; amount: number }[] = []

    if (strategy === "rebalance" || strategy === "ceiling") {
        const futureTotal = totalNetWorth + amount

        const activeAssets = strategy === "ceiling"
            ? assets.filter(a => !a.ceilingPrice || a.price <= a.ceilingPrice)
            : assets

        recs = activeAssets.map((asset) => {
            const targetValue = toCents(futureTotal * (asset.targetPercentage / 100))
            const toBuy = targetValue - asset.currentValue
            return { name: asset.name, amount: Math.max(0, toBuy) }
        })

        const totalToBuy = recs.reduce((sum, r) => sum + r.amount, 0)
        if (totalToBuy > 0) {
            recs = recs.map((r) => ({ ...r, amount: (r.amount / totalToBuy) * amount }))
        }
    } else if (strategy === "proportional") {
        recs = assets.map((asset) => ({
            name: asset.name,
            amount: toCents(amount * (asset.targetPercentage / 100)),
        }))
    } else if (strategy === "waterfall") {
        let remaining = amount

        const sortedAssets = [...assets].sort((a, b) => {
            if (a.priority !== undefined && b.priority !== undefined) {
                if (a.priority !== b.priority) return a.priority - b.priority
            } else if (a.priority !== undefined) {
                return -1
            } else if (b.priority !== undefined) {
                return 1
            }
            if (b.targetPercentage !== a.targetPercentage) {
                return b.targetPercentage - a.targetPercentage
            }
            return a.id - b.id
        })

        recs = sortedAssets.map((asset) => {
            if (remaining <= 0) return { name: asset.name, amount: 0 }
            const targetValue = toCents((totalNetWorth + amount) * (asset.targetPercentage / 100))
            const needed = Math.max(0, targetValue - asset.currentValue)
            const toAllocate = Math.min(remaining, needed)
            remaining -= toAllocate
            return { name: asset.name, amount: toAllocate }
        })

        if (remaining > 0) {
            recs = recs.map((r) => {
                const asset = assets.find((a) => a.name === r.name)
                const weight = (asset?.targetPercentage || 0) / 100
                return { ...r, amount: r.amount + remaining * weight }
            })
        }
    }

    return recs.filter((r) => r.amount > BUSINESS_RULES.REBALANCE_TOLERANCE)
}

/** Retorna a cor da barra de progresso para Economia (Categoria). */
export function getEconomyBarColor(spent: number, budget: number): string {
    const percent = budget > 0 ? (spent / budget) : 0
    if (percent < BUSINESS_RULES.BUDGET_WARNING_THRESHOLD) return "var(--success)"
    if (percent < BUSINESS_RULES.BUDGET_DANGER_THRESHOLD - BUSINESS_RULES.BUDGET_TOLERANCE) return "var(--warning)"
    return "var(--danger)"
}

/** Retorna a cor da barra de progresso para Investimentos (Ativos). */
export function getAssetBarColor(currentValue: number, targetValue: number): string {
    if (targetValue === 0) return "var(--primary)"
    const ratio = currentValue / targetValue
    if (ratio >= BUSINESS_RULES.ALLOCATION_RATIOS.MIN_BALANCED && ratio <= BUSINESS_RULES.ALLOCATION_RATIOS.MAX_BALANCED) return "var(--success)"
    if (ratio >= BUSINESS_RULES.ALLOCATION_RATIOS.MIN_ACCEPTABLE && ratio < BUSINESS_RULES.ALLOCATION_RATIOS.MIN_BALANCED) return "var(--primary)"
    if (ratio > BUSINESS_RULES.ALLOCATION_RATIOS.MAX_BALANCED && ratio <= BUSINESS_RULES.ALLOCATION_RATIOS.MAX_ACCEPTABLE) return "var(--warning)"
    return "var(--danger)"
}

