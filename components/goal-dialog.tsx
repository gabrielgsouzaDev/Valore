"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/contexts/app-context"

interface Goal {
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

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal | null
  onSave: (goal: Omit<Goal, "id">) => void
}

export function GoalDialog({ open, onOpenChange, goal, onSave }: GoalDialogProps) {
  const { banks, categories } = useApp()
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    current: "",
    deadline: "",
    monthlyContribution: "",
    priority: "média" as "alta" | "média" | "baixa",
    category: "",
    bankId: "",
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        target: goal.target.toString(),
        current: goal.current.toString(),
        deadline: goal.deadline,
        monthlyContribution: goal.monthlyContribution.toString(),
        priority: goal.priority,
        category: goal.category,
        bankId: goal.bankId?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        target: "",
        current: "0",
        deadline: "",
        monthlyContribution: "",
        priority: "média",
        category: "",
        bankId: "",
      })
    }
  }, [goal, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      target: Number.parseFloat(formData.target),
      current: Number.parseFloat(formData.current),
      deadline: formData.deadline,
      monthlyContribution: Number.parseFloat(formData.monthlyContribution),
      priority: formData.priority,
      category: formData.category,
      bankId: formData.bankId ? Number.parseInt(formData.bankId) : undefined,
    })
    setFormData({
      name: "",
      target: "",
      current: "0",
      deadline: "",
      monthlyContribution: "",
      priority: "média",
      category: "",
      bankId: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? "Editar Objetivo" : "Adicionar Objetivo"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {goal ? "Atualize as informações do objetivo" : "Crie um novo objetivo financeiro"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Objetivo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Reserva de Emergência"
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="target">Meta (R$)</Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="Ex: 60000"
                  className="bg-muted border-border text-foreground"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="current">Valor Atual (R$)</Label>
                <Input
                  id="current"
                  type="number"
                  step="0.01"
                  value={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                  placeholder="Ex: 35000"
                  className="bg-muted border-border text-foreground"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="deadline">Prazo</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="bg-muted border-border text-foreground"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthlyContribution">Aporte Mensal (R$)</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  step="0.01"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  placeholder="Ex: 2500"
                  className="bg-muted border-border text-foreground"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as "alta" | "média" | "baixa" })}
                >
                  <SelectTrigger id="priority" className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="média">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">Nenhuma categoria cadastrada</p>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank">Instituição / Banco (Opcional)</Label>
              <Select
                value={formData.bankId}
                onValueChange={(value) => setFormData({ ...formData, bankId: value })}
              >
                <SelectTrigger id="bank" className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Selecione a instituição" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      {bank.name}
                    </SelectItem>
                  ))}
                  {banks.length === 0 && (
                    <p className="text-xs text-muted-foreground p-2">Nenhum banco cadastrado</p>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {goal ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
