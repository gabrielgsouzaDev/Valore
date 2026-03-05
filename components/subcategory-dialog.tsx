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

interface Subcategory {
  id: number
  name: string
  budgeted: number
  spent: number
}

interface SubcategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subcategory: Subcategory | null
  onSave: (subcategory: Omit<Subcategory, "id">) => void
}

export function SubcategoryDialog({ open, onOpenChange, subcategory, onSave }: SubcategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    budgeted: "",
    spent: "",
  })

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name,
        budgeted: subcategory.budgeted.toString(),
        spent: subcategory.spent.toString(),
      })
    } else {
      setFormData({
        name: "",
        budgeted: "",
        spent: "0",
      })
    }
  }, [subcategory, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      budgeted: Number.parseFloat(formData.budgeted),
      spent: Number.parseFloat(formData.spent),
    })
    setFormData({ name: "", budgeted: "", spent: "0" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>{subcategory ? "Editar Subcategoria" : "Adicionar Subcategoria"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {subcategory ? "Atualize as informações da subcategoria" : "Crie uma nova subcategoria"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground/80">Nome da Subcategoria</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Aluguel, Mercado"
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
                placeholder="Ex: 2000"
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="spent" className="text-foreground/80">Gasto (R$)</Label>
              <Input
                id="spent"
                type="number"
                step="0.01"
                value={formData.spent}
                onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
                placeholder="Ex: 1500"
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {subcategory ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
