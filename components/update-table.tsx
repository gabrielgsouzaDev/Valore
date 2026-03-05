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
}

interface UpdateTableProps {
  assets: Asset[]
  onUpdate: (id: number, quantity: number, price: number) => void
}

export function UpdateTable({ assets, onUpdate }: UpdateTableProps) {
  const [editingAsset, setEditingAsset] = useState<number | null>(null)
  const [tempQuantity, setTempQuantity] = useState("")
  const [tempPrice, setTempPrice] = useState("")

  const handleUpdate = (id: number) => {
    const quantity = Number.parseFloat(tempQuantity)
    const price = Number.parseFloat(tempPrice)

    if (!isNaN(quantity) && !isNaN(price)) {
      onUpdate(id, quantity, price)
      setEditingAsset(null)
      setTempQuantity("")
      setTempPrice("")
    }
  }

  const startEditing = (asset: Asset) => {
    setEditingAsset(asset.id)
    setTempQuantity(asset.quantity.toString())
    setTempPrice(asset.price.toString())
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
                <Input
                  type="number"
                  value={tempQuantity}
                  onChange={(e) => setTempQuantity(e.target.value)}
                  placeholder="Quantidade"
                  className="bg-muted border-border text-foreground"
                />
                <Input
                  type="number"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  placeholder="Preço"
                  className="bg-muted border-border text-foreground"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdate(asset.id)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 transition-colors font-medium"
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setEditingAsset(null)}
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  Qtd: <span className="font-semibold text-foreground">{asset.quantity}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Preço:{" "}
                  <span className="font-semibold text-foreground">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(asset.price)}
                  </span>
                </div>
                <Button
                  onClick={() => startEditing(asset)}
                  size="sm"
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted transition-theme font-medium"
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
