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
import { Loader2 } from "lucide-react"
import { CATEGORY_COLOR_OPTIONS } from "@/lib/category-colors"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await new Promise(r => setTimeout(r, 400)) // Mimic saving
      onSave({
        name: formData.name,
        percentage: Number.parseFloat(formData.percentage) || 0,
        budgeted: Number.parseFloat(formData.budgeted) || 0,
        color: formData.color,
      })
      setFormData({ name: "", percentage: "", budgeted: "", color: "emerald" })
    } finally {
      setIsSubmitting(false)
    }
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
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger id="color" className="bg-muted border-border text-foreground h-10">
                  <SelectValue placeholder="Selecione uma cor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CATEGORY_COLOR_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border border-border/50 shrink-0" style={{ backgroundColor: c.hex }} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (category ? "Salvar" : "Adicionar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
