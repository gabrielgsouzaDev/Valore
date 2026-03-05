import { InvoiceProjection, CardExpense, CreditCard, ThemePreset } from "./types"
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
