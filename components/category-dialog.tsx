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

interface Category {
  id: number
  name: string
  percentage: number
  budgeted: number
  color: string
}

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onSave: (category: Omit<Category, "id">) => void
}

export function CategoryDialog({ open, onOpenChange, category, onSave }: CategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    percentage: "",
    budgeted: "",
    color: "emerald",
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        percentage: category.percentage.toString(),
        budgeted: category.budgeted.toString(),
        color: category.color,
      })
    } else {
      setFormData({
        name: "",
        percentage: "",
        budgeted: "",
        color: "emerald",
      })
    }
  }, [category, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      percentage: Number.parseFloat(formData.percentage),
      budgeted: Number.parseFloat(formData.budgeted),
      color: formData.color,
    })
    setFormData({ name: "", percentage: "", budgeted: "", color: "emerald" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoria" : "Adicionar Categoria"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {category ? "Atualize as informações da categoria" : "Crie uma nova categoria de orçamento"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground/80">Nome da Categoria</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Moradia, Alimentação"
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="percentage" className="text-foreground/80">Percentual do Orçamento (%)</Label>
              <Input
                id="percentage"
                type="number"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                placeholder="Ex: 30"
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="budgeted" className="text-foreground/80">Orçamento (R$)</Label>
              <Input
                id="budgeted"
                type="number"
                step="0.01"
                value={formData.budgeted}
                onChange={(e) => setFormData({ ...formData, budgeted: e.target.value })}
                placeholder="Ex: 3000"
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color" className="text-foreground/80">Cor</Label>
              <select
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="emerald">Verde</option>
                <option value="cyan">Ciano</option>
                <option value="blue">Azul</option>
                <option value="violet">Violeta</option>
                <option value="amber">Âmbar</option>
                <option value="red">Vermelho</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {category ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
