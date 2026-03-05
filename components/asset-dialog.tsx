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

interface Asset {
  id: number
  name: string
  targetPercentage: number
  currentValue: number
  quantity: number
  price: number
}

interface AssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  onSave: (asset: Omit<Asset, "id" | "currentValue">) => void
}

export function AssetDialog({ open, onOpenChange, asset, onSave }: AssetDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    targetPercentage: "",
    quantity: "",
    price: "",
  })

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        targetPercentage: asset.targetPercentage.toString(),
        quantity: asset.quantity.toString(),
        price: asset.price.toString(),
      })
    } else {
      setFormData({
        name: "",
        targetPercentage: "",
        quantity: "",
        price: "",
      })
    }
  }, [asset, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      targetPercentage: Number.parseFloat(formData.targetPercentage),
      quantity: Number.parseFloat(formData.quantity),
      price: Number.parseFloat(formData.price),
    })
    setFormData({ name: "", targetPercentage: "", quantity: "", price: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground transition-theme">
        <DialogHeader>
          <DialogTitle>{asset ? "Editar Ativo" : "Adicionar Ativo"}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {asset ? "Atualize as informações do ativo" : "Adicione um novo ativo ao seu portfólio"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Nome do Ativo
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: VWRA11, Bitcoin"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="targetPercentage" className="text-foreground font-medium">
                Meta de Alocação (%)
              </Label>
              <Input
                id="targetPercentage"
                type="number"
                step="0.01"
                value={formData.targetPercentage}
                onChange={(e) => setFormData({ ...formData, targetPercentage: e.target.value })}
                placeholder="Ex: 65"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity" className="text-foreground font-medium">
                Quantidade
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Ex: 100"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price" className="text-foreground font-medium">
                Preço Unitário (R$)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Ex: 140.50"
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-theme"
            >
              {asset ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
