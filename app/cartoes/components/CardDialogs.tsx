"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Bank, Category } from "@/lib/types"

const cardColors = [
    { value: "violet", label: "Roxo", class: "bg-violet-500" },
    { value: "orange", label: "Laranja", class: "bg-orange-500" },
    { value: "emerald", label: "Verde", class: "bg-emerald-500" },
    { value: "blue", label: "Azul", class: "bg-blue-500" },
    { value: "rose", label: "Rosa", class: "bg-rose-500" },
    { value: "cyan", label: "Ciano", class: "bg-cyan-500" },
    { value: "amber", label: "Dourado", class: "bg-amber-500" },
    { value: "slate", label: "Prateado", class: "bg-slate-500" },
    { value: "zinc", label: "Preto", class: "bg-zinc-800" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
]

interface CardDialogsProps {
    cardDialogOpen: boolean
    setCardDialogOpen: (open: boolean) => void
    cardForm: any
    setCardForm: (form: any) => void
    editingCardId: number | null
    banks: Bank[]
    onCardSubmit: () => void

    expenseDialogOpen: boolean
    setExpenseDialogOpen: (open: boolean) => void
    expenseForm: any
    setExpenseForm: (form: any) => void
    categories: Category[]
    onExpenseSubmit: () => void

    isSubmitting: boolean
}

export function CardDialogs({
    cardDialogOpen,
    setCardDialogOpen,
    cardForm,
    setCardForm,
    editingCardId,
    banks,
    onCardSubmit,
    expenseDialogOpen,
    setExpenseDialogOpen,
    expenseForm,
    setExpenseForm,
    categories,
    onExpenseSubmit,
    isSubmitting
}: CardDialogsProps) {
    return (
        <>
            <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
                <DialogContent className="bg-card border-border sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">{editingCardId ? "Editar Cartão" : "Novo Cartão"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-foreground/80">Nome do Cartão</Label>
                            <Input
                                value={cardForm.name}
                                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                                placeholder="Ex: Black, Platinum..."
                                className="bg-muted border-border text-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Banco Emissor</Label>
                                <Select
                                    value={cardForm.bankId?.toString()}
                                    onValueChange={(v) => setCardForm({ ...cardForm, bankId: parseInt(v) })}
                                >
                                    <SelectTrigger className="bg-muted border-border text-foreground">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {banks.map((b) => (<SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Limite (R$)</Label>
                                <Input
                                    type="number"
                                    value={cardForm.limit}
                                    onChange={(e) => setCardForm({ ...cardForm, limit: parseFloat(e.target.value) || 0 })}
                                    className="bg-muted border-border text-foreground"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Dia Fechamento</Label>
                                <Input
                                    type="number"
                                    min="1" max="31"
                                    value={cardForm.closingDay}
                                    onChange={(e) => setCardForm({ ...cardForm, closingDay: parseInt(e.target.value) || 1 })}
                                    className="bg-muted border-border text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Dia Vencimento</Label>
                                <Input
                                    type="number"
                                    min="1" max="31"
                                    value={cardForm.dueDay}
                                    onChange={(e) => setCardForm({ ...cardForm, dueDay: parseInt(e.target.value) || 1 })}
                                    className="bg-muted border-border text-foreground"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/80">Cor do Cartão</Label>
                            <div className="flex flex-wrap gap-2">
                                {cardColors.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setCardForm({ ...cardForm, color: c.value })}
                                        className={cn(
                                            "w-7 h-7 rounded-sm border-2 transition-all",
                                            c.class,
                                            cardForm.color === c.value ? "border-foreground scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCardDialogOpen(false)} className="border-border bg-transparent">Cancelar</Button>
                        <Button onClick={onCardSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Salvar Cartão
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                <DialogContent className="bg-card border-border sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Nova Despesa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-foreground/80">Descrição</Label>
                            <Input
                                value={expenseForm.description}
                                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                placeholder="Onde você comprou?"
                                className="bg-muted border-border text-foreground font-medium"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Valor Total (R$)</Label>
                                <Input
                                    type="number"
                                    value={expenseForm.totalAmount}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, totalAmount: parseFloat(e.target.value) || 0 })}
                                    className="bg-muted border-border text-foreground font-black italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Parcelas</Label>
                                <Input
                                    type="number"
                                    min="1" max="48"
                                    value={expenseForm.installments}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, installments: parseInt(e.target.value) || 1 })}
                                    className="bg-muted border-border text-foreground"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground/80">Data da Compra</Label>
                            <Input
                                type="date"
                                value={expenseForm.purchaseDate}
                                onChange={(e) => setExpenseForm({ ...expenseForm, purchaseDate: e.target.value })}
                                className="bg-muted border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExpenseDialogOpen(false)} className="border-border bg-transparent font-bold">Cancelar</Button>
                        <Button onClick={onExpenseSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black italic">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Adicionar Gasto
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
