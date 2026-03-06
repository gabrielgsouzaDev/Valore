"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

import type { Asset } from "@/lib/types"

interface UpdateTableProps {
  assets: Asset[]
  onUpdate: (id: number, quantity: number, price: number, ceilingPrice?: number, priority?: number) => void
}

export function UpdateTable({ assets, onUpdate }: UpdateTableProps) {
  const [editingAsset, setEditingAsset] = useState<number | null>(null)
  const [tempQuantity, setTempQuantity] = useState("")
  const [tempPrice, setTempPrice] = useState("")
  const [tempCeiling, setTempCeiling] = useState("")
  const [tempPriority, setTempPriority] = useState("")

  const handleUpdate = (id: number) => {
    const quantity = Number.parseFloat(tempQuantity)
    const price = Number.parseFloat(tempPrice)
    const ceiling = tempCeiling === "" ? undefined : Number.parseFloat(tempCeiling)
    const priority = tempPriority === "" ? undefined : Number.parseInt(tempPriority)

    if (!isNaN(quantity) && !isNaN(price)) {
      onUpdate(id, quantity, price, ceiling, priority)
      setEditingAsset(null)
      setTempQuantity("")
      setTempPrice("")
      setTempCeiling("")
      setTempPriority("")
    }
  }

  const startEditing = (asset: Asset) => {
    setEditingAsset(asset.id)
    setTempQuantity(asset.quantity.toString())
    setTempPrice(asset.price.toString())
    setTempCeiling(asset.ceilingPrice?.toString() || "")
    setTempPriority(asset.priority?.toString() || "")
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)

  return (
    <Card className="bg-card border-border p-4 sm:p-6 transition-theme">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Atualização Rápida</h3>

      {/* Mobile: cards empilhados | Desktop: grid 4 colunas */}
      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="p-4 bg-muted/20 border border-border rounded-xl transition-theme"
          >
            {/* Header do card: nome + botão atualizar */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground text-sm sm:text-base">{asset.name}</span>
              {editingAsset !== asset.id && (
                <Button
                  onClick={() => startEditing(asset)}
                  size="icon"
                  variant="ghost"
                  aria-label={`Atualizar ${asset.name}`}
                  className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {editingAsset === asset.id ? (
              /* ── MODO EDIÇÃO ── */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                      Quantidade
                    </label>
                    <Input
                      type="number"
                      value={tempQuantity}
                      onChange={(e) => setTempQuantity(e.target.value)}
                      placeholder="Qtd"
                      className="bg-muted/30 border-border text-foreground text-sm h-11"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                      Preço Atual
                    </label>
                    <Input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      placeholder="R$"
                      className="bg-muted/30 border-border text-foreground text-sm h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                      Teto (R$)
                    </label>
                    <Input
                      type="number"
                      value={tempCeiling}
                      onChange={(e) => setTempCeiling(e.target.value)}
                      placeholder="Opcional"
                      className="bg-muted/30 border-border text-foreground text-sm h-11"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                      Prioridade
                    </label>
                    <Input
                      type="number"
                      value={tempPriority}
                      onChange={(e) => setTempPriority(e.target.value)}
                      placeholder="1, 2, 3..."
                      className="bg-muted/30 border-border text-foreground text-sm h-11"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdate(asset.id)}
                    aria-label={`Salvar alterações em ${asset.name}`}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium min-h-[44px]"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setEditingAsset(null)}
                    variant="outline"
                    aria-label="Cancelar edição"
                    className="border-border text-foreground hover:bg-muted min-h-[44px] px-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* ── MODO VISUALIZAÇÃO: inline no mobile, row no desktop ── */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Patrimônio</div>
                  <div className="text-sm font-semibold text-foreground">
                    {asset.quantity}x {fmt(asset.price)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Teto</div>
                  <div className="text-sm text-foreground">
                    {asset.ceilingPrice ? fmt(asset.ceilingPrice) : <span className="text-muted-foreground">∞</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Prioridade</div>
                  <div className="text-sm text-foreground">
                    {asset.priority ?? <span className="text-muted-foreground">—</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
