export type Subcategory = {
    id: number
    name: string
    budgeted: number
    spent: number
}

export type Category = {
    id: number
    name: string
    percentage: number
    budgeted: number
    spent: number
    color: string
    subcategories?: Subcategory[]
    expanded?: boolean
}

export type ScheduledTransaction = {
    id: number
    name: string
    amount: number
    type: "pagamento" | "ganho"
    dueDate: string
    recurrence: "unico" | "semanal" | "mensal" | "anual"
    categoryId?: number
    status: "pendente" | "pago" | "atrasado"
    notes?: string
    bankId?: number
    transactionHash?: string
}
