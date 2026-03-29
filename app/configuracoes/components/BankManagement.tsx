"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Building2, Plus, Pencil, Trash2, Landmark, PiggyBank, Wallet, TrendingUp, Smartphone, HelpCircle, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Bank, BankType } from "@/lib/types"

const bankTypes: { value: BankType; label: string; icon: React.ReactNode }[] = [
    { value: "conta_corrente", label: "Conta Corrente", icon: <Landmark className="h-4 w-4" /> },
    { value: "poupanca", label: "Poupança", icon: <PiggyBank className="h-4 w-4" /> },
    { value: "carteira_digital", label: "Carteira Digital", icon: <Wallet className="h-4 w-4" /> },
    { value: "corretora", label: "Corretora", icon: <TrendingUp className="h-4 w-4" /> },
    { value: "banco_digital", label: "Banco Digital", icon: <Smartphone className="h-4 w-4" /> },
    { value: "outro", label: "Outro", icon: <HelpCircle className="h-4 w-4" /> },
]

const bankColors = [
    { value: "violet", label: "Roxo", class: "bg-violet-500" },
    { value: "orange", label: "Laranja", class: "bg-orange-500" },
    { value: "emerald", label: "Verde", class: "bg-emerald-500" },
    { value: "blue", label: "Azul", class: "bg-blue-500" },
    { value: "rose", label: "Rosa", class: "bg-rose-500" },
    { value: "cyan", label: "Ciano", class: "bg-cyan-500" },
    { value: "amber", label: "Âmbar", class: "bg-amber-500" },
    { value: "slate", label: "Cinza", class: "bg-slate-500" },
]

interface BankManagementProps {
    banks: Bank[]
    onAddBank: (bank: any) => void
    onUpdateBank: (id: number, bank: any) => void
    onDeleteBank: (id: number) => void
    formatCurrency: (val: number) => string
}

export function BankManagement({
    banks,
    onAddBank,
    onUpdateBank,
    onDeleteBank,
    formatCurrency
}: BankManagementProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBank, setEditingBank] = useState<Bank | null>(null)
    const [bankForm, setBankForm] = useState({
        name: "",
        type: "banco_digital" as BankType,
        color: "violet",
        balance: 0,
        isMain: false,
        notes: "",
    })

    const openAddBank = () => {
        setEditingBank(null)
        setBankForm({
            name: "",
            type: "banco_digital",
            color: "violet",
            balance: 0,
            isMain: false,
            notes: "",
        })
        setDialogOpen(true)
    }

    const openEditBank = (bank: Bank) => {
        setEditingBank(bank)
        setBankForm({
            name: bank.name,
            type: bank.type,
            color: bank.color,
            balance: bank.balance,
            isMain: bank.isMain,
            notes: bank.notes || "",
        })
        setDialogOpen(true)
    }

    const handleSave = () => {
        if (!bankForm.name) return
        if (editingBank) {
            onUpdateBank(editingBank.id, bankForm)
        } else {
            onAddBank(bankForm)
        }
        setDialogOpen(false)
    }

    const getBankTypeInfo = (type: BankType) => {
        return bankTypes.find((t) => t.value === type) || bankTypes[5]
    }

    const getColorClass = (color: string) => {
        return bankColors.find((c) => c.value === color)?.class || "bg-slate-500"
    }

    const totalBalance = banks.reduce((sum, b) => sum + b.balance, 0)

    return (
        <Card className="bg-card border-border">
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        Bancos e Contas
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Total em conta: <span className="font-bold text-success">{formatCurrency(totalBalance)}</span>
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={openAddBank} className="border-border hover:bg-muted text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Novo
                </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3">
                    {banks.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Nenhum banco cadastrado</p>
                        </div>
                    ) : (
                        banks.map((bank) => {
                            const typeInfo = getBankTypeInfo(bank.type)
                            return (
                                <div
                                    key={bank.id}
                                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 group hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", getColorClass(bank.color))}>
                                            {typeInfo.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                                {bank.name}
                                                {bank.isMain && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-black">Principal</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium">{formatCurrency(bank.balance)} • {typeInfo.label}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => openEditBank(bank)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDeleteBank(bank.id)} className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all rounded-lg">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="bg-card border-border sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-foreground">{editingBank ? "Editar Banco" : "Novo Banco"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Nome da Instituição</Label>
                                <Input value={bankForm.name} onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })} placeholder="Ex: Nubank, Itaú..." className="bg-muted border-border text-foreground" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground/80">Tipo de Conta</Label>
                                    <Select value={bankForm.type} onValueChange={(v: BankType) => setBankForm({ ...bankForm, type: v })}>
                                        <SelectTrigger className="bg-muted border-border text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {bankTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground/80">Saldo Atual (R$)</Label>
                                    <Input type="number" value={bankForm.balance} onChange={(e) => setBankForm({ ...bankForm, balance: parseFloat(e.target.value) || 0 })} className="bg-muted border-border text-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Cor de Identificação</Label>
                                <div className="flex flex-wrap gap-2">
                                    {bankColors.map((c) => (
                                        <button
                                            key={c.value}
                                            onClick={() => setBankForm({ ...bankForm, color: c.value })}
                                            className={cn("w-8 h-8 rounded-full border-2 transition-all", c.class, bankForm.color === c.value ? "border-foreground scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100")}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                                <Label className="text-sm font-bold text-foreground">Conta Principal</Label>
                                <Switch checked={bankForm.isMain} onCheckedChange={(val) => setBankForm({ ...bankForm, isMain: val })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Notas (opcional)</Label>
                                <Textarea value={bankForm.notes} onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })} className="bg-muted border-border text-foreground resize-none" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border bg-transparent">Cancelar</Button>
                            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <Save className="h-4 w-4 mr-2" /> Salvar Banco
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
