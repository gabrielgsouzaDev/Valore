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

interface Goal {
  id: number
  name: string
  target: number
  current: number
  deadline: string
  monthlyContribution: number
  priority: "alta" | "média" | "baixa"
  category: string
}

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal | null
  onSave: (goal: Omit<Goal, "id">) => void
}

export function GoalDialog({ open, onOpenChange, goal, onSave }: GoalDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    current: "",
    deadline: "",
    monthlyContribution: "",
    priority: "média" as "alta" | "média" | "baixa",
    category: "",
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
    })
    setFormData({
      name: "",
      target: "",
      current: "0",
      deadline: "",
      monthlyContribution: "",
      priority: "média",
      category: "",
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
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as "alta" | "média" | "baixa" })}
                  className="bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="alta">Alta</option>
                  <option value="média">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Segurança, Lazer"
                  className="bg-muted border-border text-foreground"
                  required
                />
              </div>
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
