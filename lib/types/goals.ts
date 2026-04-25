export type Goal = {
    id: number
    name: string
    target: number
    current: number
    deadline: string
    monthlyContribution: number
    priority: "alta" | "média" | "baixa"
    category: string
    bankId?: number
}
