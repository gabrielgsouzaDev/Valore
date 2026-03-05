import { InvoiceProjection, CardExpense, CreditCard, ThemePreset, Asset, InvestmentStrategy } from "./types"
import { addMonths, format, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Calcula a projeção de faturas de cartão de crédito.
 * @param expenses Lista de despesas de cartão
 * @param cards Lista de cartões de crédito
 * @param cardId Opcional: ID do cartão específico
 * @returns Array de projeções por mês para os próximos 12 meses
 */
export function calculateInvoices(
    expenses: CardExpense[],
    cards: CreditCard[],
    cardId?: number
): InvoiceProjection[] {
    const projections: InvoiceProjection[] = []
    const today = new Date()

    for (let i = 0; i < 12; i++) {
        const projectionDate = addMonths(startOfMonth(today), i)
        const monthName = format(projectionDate, "MMMM", { locale: ptBR })
        const year = projectionDate.getFullYear()

        const monthlyExpenses: { description: string; amount: number; installment: string }[] = []
        let monthlyTotal = 0

        expenses.forEach((expense) => {
            // Se filtrar por cardId e não for o cartão, ignora
            if (cardId && expense.cardId !== cardId) return

            const card = cards.find((c) => c.id === expense.cardId)
            if (!card) return

            const purchaseDate = new Date(expense.purchaseDate)
            const closingDay = card.closingDay

            // Ajuste simplificado de fatura baseada no dia de fechamento
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
                const installmentAmount = expense.totalAmount / expense.installments
                monthlyTotal += installmentAmount
                monthlyExpenses.push({
                    description: expense.description,
                    amount: installmentAmount,
                    installment: `${actualInstallmentIndex + 1}/${expense.installments}`,
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

/**
 * Formata um valor numérico para moeda brasileira (BRL).
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value)
}

/**
 * Aplica o tema visual ao documento via variáveis CSS.
 * Usa um mapeamento direto das cores do tema para as propriedades CSS.
 */
export function applyThemeVariables(theme: ThemePreset) {
    if (typeof document === "undefined") return

    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
        // Converte camelCase para kebab-case e adiciona prefixo --theme-
        const cssVarName = `--theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
        root.style.setProperty(cssVarName, value as string)
    })
}

/**
 * Calcula a distribuição de um aporte entre diversos ativos com base em uma estratégia.
 */
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

        // Se for teto, filtramos ativos que estão acima do preço-teto
        const activeAssets = strategy === "ceiling"
            ? assets.filter(a => !a.ceilingPrice || a.price <= a.ceilingPrice)
            : assets

        recs = activeAssets.map((asset) => {
            const targetValue = futureTotal * (asset.targetPercentage / 100)
            const toBuy = targetValue - asset.currentValue
            return {
                name: asset.name,
                amount: Math.max(0, toBuy),
            }
        })

        // Ajuste proporcional se o toBuy total for diferente do aporte (devido ao Math.max ou filtro)
        const totalToBuy = recs.reduce((sum, r) => sum + r.amount, 0)
        if (totalToBuy > 0) {
            recs = recs.map((r) => ({
                ...r,
                amount: (r.amount / totalToBuy) * amount,
            }))
        }
    } else if (strategy === "proportional") {
        recs = assets.map((asset) => ({
            name: asset.name,
            amount: amount * (asset.targetPercentage / 100),
        }))
    } else if (strategy === "waterfall") {
        let remaining = amount

        // Ordenação: Prioridade manual (se houver) -> Peso da meta -> ID (desempate final)
        const sortedAssets = [...assets].sort((a, b) => {
            if (a.priority !== undefined && b.priority !== undefined) {
                if (a.priority !== b.priority) return a.priority - b.priority
            } else if (a.priority !== undefined) {
                return -1
            } else if (b.priority !== undefined) {
                return 1
            }

            // Primeiro desempate: Peso da meta (maior primeiro)
            if (b.targetPercentage !== a.targetPercentage) {
                return b.targetPercentage - a.targetPercentage
            }

            // Segundo desempate: ID (menor primeiro - ordem de criação)
            return a.id - b.id
        })

        recs = sortedAssets.map((asset) => {
            if (remaining <= 0) return { name: asset.name, amount: 0 }

            const targetValue = (totalNetWorth + amount) * (asset.targetPercentage / 100)
            const needed = Math.max(0, targetValue - asset.currentValue)
            const toAllocate = Math.min(remaining, needed)

            remaining -= toAllocate
            return { name: asset.name, amount: toAllocate }
        })

        // Se sobrar algo após o waterfall, distribui proporcionalmente no final
        if (remaining > 0) {
            recs = recs.map((r) => {
                const asset = assets.find((a) => a.name === r.name)
                const weight = (asset?.targetPercentage || 0) / 100
                return { ...r, amount: r.amount + remaining * weight }
            })
        }
    }

    return recs.filter((r) => r.amount > 0.01)
}
