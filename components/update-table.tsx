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
  onUpdate: (id: number, quantity: number, price: number, ceilingPrice?: number, priority?: number, averagePrice?: number, annualDividend?: number) => void
}

export function UpdateTable({ assets, onUpdate }: UpdateTableProps) {
  const [editingAsset, setEditingAsset] = useState<number | null>(null)
  const [tempQuantity, setTempQuantity] = useState("")
  const [tempPrice, setTempPrice] = useState("")
  const [tempCeiling, setTempCeiling] = useState("")
  const [tempPriority, setTempPriority] = useState("")
  const [tempAverage, setTempAverage] = useState("")
  const [tempDividend, setTempDividend] = useState("")

  const handleUpdate = (id: number) => {
    const quantity = Number(tempQuantity) || 0
    const price = Number(tempPrice) || 0
    const ceiling = tempCeiling === "" ? undefined : Number(tempCeiling)
    const priority = tempPriority === "" ? undefined : Number(tempPriority)
    const average = tempAverage === "" ? undefined : Number(tempAverage)
    const dividend = tempDividend === "" ? undefined : Number(tempDividend)

    if (!isNaN(quantity) && !isNaN(price)) {
      onUpdate(id, quantity, price, ceiling, priority, average, dividend)
      setEditingAsset(null)
      setTempQuantity("")
      setTempPrice("")
      setTempCeiling("")
      setTempPriority("")
      setTempAverage("")
      setTempDividend("")
    }
  }

  const startEditing = (asset: Asset) => {
    setEditingAsset(asset.id)
    setTempQuantity(asset.quantity.toString())
    setTempPrice(asset.price.toString())
    setTempCeiling(asset.ceilingPrice?.toString() || "")
    setTempPriority(asset.priority?.toString() || "")
    setTempAverage(asset.averagePrice?.toString() || "")
    setTempDividend(asset.annualDividend?.toString() || "")
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)

  return (
    <Card className="bg-card border-border p-4 sm:p-6 transition-theme">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Atualização Rápida</h3>

      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="p-4 bg-muted/20 border border-border rounded-xl transition-theme"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground text-sm sm:text-base">{asset.name}</span>
              {editingAsset !== asset.id && (
                <Button
                  onClick={() => startEditing(asset)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150 rounded-md"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {editingAsset === asset.id ? (
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
                      Custo Médio
                    </label>
                    <Input
                      type="number"
                      value={tempAverage}
                      onChange={(e) => setTempAverage(e.target.value)}
                      placeholder="R$"
                      className="bg-muted/30 border-border text-foreground text-sm h-11"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                      Proventos (Anual)
                    </label>
                    <Input
                      type="number"
                      value={tempDividend}
                      onChange={(e) => setTempDividend(e.target.value)}
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
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium min-h-[44px]"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setEditingAsset(null)}
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted min-h-[44px] px-4"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Patrimônio</div>
                  <div className="text-sm font-semibold text-foreground">
                    {asset.quantity}x {fmt(asset.price)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Rentabilidade</div>
                  <div className={cn(
                    "text-sm font-bold",
                    asset.price >= asset.averagePrice ? "text-success" : "text-danger"
                  )}>
                    {asset.averagePrice > 0 ? (((asset.price / asset.averagePrice) - 1) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Yield (YOC)</div>
                  <div className="text-sm text-foreground font-semibold">
                    {asset.annualDividend && asset.averagePrice > 0 ? ((asset.annualDividend / asset.averagePrice) * 100).toFixed(2) : "0.00"}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Teto</div>
                  <div className="text-sm text-foreground">
                    {asset.ceilingPrice ? fmt(asset.ceilingPrice) : <span className="text-muted-foreground">∞</span>}
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
