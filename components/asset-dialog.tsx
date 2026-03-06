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
import { AssetType } from "@/lib/types"

interface Asset {
  id: number
  name: string
  type: AssetType
  targetPercentage: number
  currentValue: number
  quantity: number
  price: number
  bankId?: number
}

interface AssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  onSave: (asset: Omit<Asset, "id" | "currentValue">) => void
}

export function AssetDialog({ open, onOpenChange, asset, onSave }: AssetDialogProps) {
  const { banks } = useApp()
  const [formData, setFormData] = useState({
    name: "",
    type: "Ação" as AssetType,
    targetPercentage: "",
    quantity: "",
    price: "",
    bankId: "",
  })

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        type: asset.type,
        targetPercentage: asset.targetPercentage.toString(),
        quantity: asset.quantity.toString(),
        price: asset.price.toString(),
        bankId: asset.bankId?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        type: "Ação",
        targetPercentage: "",
        quantity: "",
        price: "",
        bankId: "",
      })
    }
  }, [asset, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      type: formData.type,
      targetPercentage: Number.parseFloat(formData.targetPercentage),
      quantity: Number.parseFloat(formData.quantity),
      price: Number.parseFloat(formData.price),
      bankId: formData.bankId ? Number.parseInt(formData.bankId) : undefined,
    })
    setFormData({ name: "", type: "Ação", targetPercentage: "", quantity: "", price: "", bankId: "" })
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
              <Label htmlFor="type" className="text-foreground font-medium">
                Tipo de Ativo
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as AssetType })}
              >
                <SelectTrigger id="type" className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Ação">Ação</SelectItem>
                  <SelectItem value="FII">FII</SelectItem>
                  <SelectItem value="ETF">ETF</SelectItem>
                  <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                  <SelectItem value="Cripto">Cripto</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank" className="text-foreground font-medium">
                Instituição / Banco
              </Label>
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
