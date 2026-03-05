"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

interface Asset {
  id: number
  name: string
  quantity: number
  price: number
  ceilingPrice?: number
  priority?: number
}

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

  return (
    <Card className="bg-card border-border p-6 transition-theme">
      <h3 className="text-lg font-semibold text-foreground mb-4">Atualização Rápida</h3>
      <div className="space-y-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-card border border-border rounded-lg hover:bg-card/80 transition-theme"
          >
            <div className="flex items-center">
              <span className="font-semibold text-foreground">{asset.name}</span>
            </div>

            {editingAsset === asset.id ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={tempQuantity}
                    onChange={(e) => setTempQuantity(e.target.value)}
                    placeholder="Qtd"
                    className="bg-muted border-border text-foreground text-xs"
                  />
                  <Input
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    placeholder="Preço"
                    className="bg-muted border-border text-foreground text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={tempCeiling}
                    onChange={(e) => setTempCeiling(e.target.value)}
                    placeholder="Teto (R$)"
                    className="bg-muted border-border text-foreground text-xs"
                  />
                  <Input
                    type="number"
                    value={tempPriority}
                    onChange={(e) => setTempPriority(e.target.value)}
                    placeholder="Prioridade"
                    className="bg-muted border-border text-foreground text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdate(asset.id)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 transition-colors font-medium text-xs"
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setEditingAsset(null)}
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Patrimônio</div>
                  <div className="text-sm font-semibold text-foreground">
                    {asset.quantity} un @ {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(asset.price)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-bold">Regras</div>
                  <div className="text-sm text-foreground flex gap-3">
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">Teto:</span>
                      {asset.ceilingPrice
                        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(asset.ceilingPrice)
                        : "∞"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">Prio:</span>
                      {asset.priority ?? "—"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => startEditing(asset)}
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted transition-theme font-medium sm:self-center"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
