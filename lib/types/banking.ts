import type { BankType } from "./core"

export type Bank = {
    id: number
    name: string
    type: BankType
    color: string
    balance: number
    isMain: boolean
    currency?: string
    notes?: string
    icon?: string
}

export type CreditCard = {
    id: number
    name: string
    limit: number
    closingDay: number
    dueDay: number
    color: string
    bankId?: number
    last4?: string
}

export type CardExpense = {
    id: number
    cardId: number
    description: string
    totalAmount: number
    installments: number
    purchaseDate: string
    paidInstallments?: number
}

export type InvoiceProjection = {
    month: string
    year: number
    monthIndex: number
    total: number
    expenses: { description: string; amount: number; installment: string; cardId: number }[]
}
