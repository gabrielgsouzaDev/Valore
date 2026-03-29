"use client"

import { Button } from "@/components/ui/button"
import { Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CardExpense } from "@/lib/types"

interface ExpenseTableProps {
    expenses: CardExpense[]
    onDeleteExpense: (id: number) => void
    formatCurrency: (val: number) => string
    isPrivate: boolean
}

export function ExpenseTable({
    expenses,
    onDeleteExpense,
    formatCurrency,
    isPrivate
}: ExpenseTableProps) {
    if (expenses.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest">Nenhuma despesa registrada</p>
                <p className="text-xs text-muted-foreground mt-1">As compras deste cartão aparecerão aqui.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle p-4 sm:p-0">
                <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-left">
                            <th className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Descrição</th>
                            <th className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-muted-foreground">Data</th>
                            <th className="px-4 py-2 text-[10px] uppercase font-black tracking-widest text-muted-foreground text-right">Valor</th>
                            <th className="px-4 py-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="space-y-4">
                        {expenses.map((expense) => {
                            return (
                                <tr key={expense.id} className="group transition-all">
                                    <td className="px-4 py-3 bg-card border-y border-l border-border rounded-l-xl first:rounded-tl-xl first:rounded-bl-xl group-hover:border-primary/30 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{expense.description}</span>
                                            {expense.installments > 1 && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full w-fit mt-1 font-bold">
                                                    Parcelado {expense.installments}x
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 bg-card border-y border-border group-hover:border-primary/30 transition-colors text-xs font-semibold text-muted-foreground">
                                        {new Date(expense.purchaseDate).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-4 py-3 bg-card border-y border-border group-hover:border-primary/30 transition-colors text-right">
                                        <span className={cn("text-sm font-black italic", isPrivate && "blur-md")}>
                                            {formatCurrency(expense.totalAmount)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 bg-card border-y border-r border-border rounded-r-xl group-hover:border-primary/30 transition-colors">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDeleteExpense(expense.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
