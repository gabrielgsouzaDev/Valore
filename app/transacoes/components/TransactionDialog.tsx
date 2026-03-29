"use client"

import { ResponsiveDialog } from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpCircle, ArrowDownCircle, Building2, Plus, Loader2 } from "lucide-react"

interface TransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: any
    setForm: (form: any) => void
    editingId: number | null
    isSubmitting: boolean
    onSubmit: () => void
    banks: any[]
    categories: any[]
    onNewCategory: () => void
}

export function TransactionDialog({
    open,
    onOpenChange,
    form,
    setForm,
    editingId,
    isSubmitting,
    onSubmit,
    banks,
    categories,
    onNewCategory
}: TransactionDialogProps) {
    return (
        <ResponsiveDialog
            open={open}
            onOpenChange={onOpenChange}
            title={editingId ? "Editar Transação" : "Nova Transação"}
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border bg-transparent text-xs sm:text-sm flex-1 sm:flex-none">Cancelar</Button>
                    <Button onClick={onSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm flex-1 sm:flex-none">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingId ? "Salvar" : "Criar"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs sm:text-sm">Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Salário, Aluguel..." className="bg-muted border-border text-foreground text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Tipo</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                        <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            <SelectItem value="ganho"><span className="flex items-center gap-2 text-success"><ArrowUpCircle className="h-3.5 w-3.5" /> Ganho</span></SelectItem>
                            <SelectItem value="pagamento"><span className="flex items-center gap-2 text-muted-foreground"><ArrowDownCircle className="h-3.5 w-3.5" /> Pagamento</span></SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Valor (R$)</Label>
                    <Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="bg-muted border-border text-foreground text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Vencimento</Label>
                    <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="bg-muted border-border text-foreground text-sm" />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Recorrência</Label>
                    <Select value={form.recurrence} onValueChange={(v) => setForm({ ...form, recurrence: v as any })}>
                        <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            <SelectItem value="unico">Único</SelectItem>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs sm:text-sm">Banco / Conta</Label>
                <Select value={form.bankId?.toString() || "none"} onValueChange={(v) => setForm({ ...form, bankId: v === "none" ? undefined : parseInt(v) })}>
                    <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue placeholder="Selecione um banco" /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="none">Sem banco vinculado</SelectItem>
                        {banks.map((bank) => (<SelectItem key={bank.id} value={bank.id.toString()}><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{bank.name}</span></SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
            {form.type === "pagamento" && (
                <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs sm:text-sm">Categoria (opcional)</Label>
                    <Select value={form.categoryId?.toString() || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? undefined : parseInt(v) })}>
                        <SelectTrigger className="bg-muted border-border text-foreground text-sm"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            <SelectItem value="none">Sem categoria</SelectItem>
                            <div className="px-2 py-1.5 mt-1 border-t border-border/50">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-xs h-8 text-primary hover:bg-primary/10"
                                    onClick={(e) => { e.preventDefault(); onNewCategory(); }}
                                >
                                    <Plus className="mr-2 h-3.5 w-3.5" /> Nova Categoria Global
                                </Button>
                            </div>
                            {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs sm:text-sm">Observações (opcional)</Label>
                <Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anotações..." className="bg-muted border-border text-foreground text-sm" />
            </div>
        </ResponsiveDialog>
    )
}
