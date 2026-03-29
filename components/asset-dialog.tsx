"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Loader2, Sparkles, AlertCircle } from "lucide-react"
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
  ticker?: string
  syncAvailable?: boolean
  type: AssetType
  targetPercentage: number
  currentValue: number
  quantity: number
  price: number
  averagePrice: number
  annualDividend?: number
  bankId?: number
}

interface SearchResult {
  ticker: string
  name: string
  price: number
  type: string
  logo?: string
}

interface AssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset: Asset | null
  onSave: (asset: Omit<Asset, "id" | "currentValue">) => void
}

export function AssetDialog({ open, onOpenChange, asset, onSave }: AssetDialogProps) {
  const { banks } = useApp()
  const [isManualMode, setIsManualMode] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    syncAvailable: false,
    type: "Ação" as AssetType,
    targetPercentage: "",
    quantity: "",
    price: "",
    averagePrice: "",
    annualDividend: "",
    bankId: "",
  })

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        ticker: asset.ticker || "",
        syncAvailable: asset.syncAvailable || false,
        type: asset.type,
        targetPercentage: asset.targetPercentage.toString(),
        quantity: asset.quantity.toString(),
        price: asset.price.toString(),
        averagePrice: asset.averagePrice?.toString() || asset.price.toString(),
        annualDividend: asset.annualDividend?.toString() || "",
        bankId: asset.bankId?.toString() || "",
      })
      setIsManualMode(true) // Editing implies seeing the form
    } else {
      setFormData({
        name: "",
        ticker: "",
        syncAvailable: false,
        type: "Ação",
        targetPercentage: "",
        quantity: "",
        price: "",
        averagePrice: "",
        annualDividend: "",
        bankId: "",
      })
      setIsManualMode(false)
      setSearchQuery("")
      setSearchResults([])
    }
  }, [asset, open])

  // Busca assíncrona com Debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/assets/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.results || [])
        }
      } catch (error) {
        console.error("Search error", error)
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  const handleSelectResult = (result: SearchResult) => {
    // Map Brapi type to our AssetType heuristically
    let mappedType: AssetType = "Ação"
    if (result.type === "fund" || result.ticker.endsWith("11")) mappedType = "FII"
    if (result.type === "bdr") mappedType = "Outro"

    setFormData({
      ...formData,
      name: result.name,
      ticker: result.ticker,
      type: mappedType,
      price: result.price?.toString() || "",
      syncAvailable: true,
    })
    setIsManualMode(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      ticker: formData.ticker || undefined,
      syncAvailable: formData.syncAvailable,
      type: formData.type,
      targetPercentage: Number.parseFloat(formData.targetPercentage) || 0,
      quantity: Number.parseFloat(formData.quantity) || 0,
      price: Number.parseFloat(formData.price) || 0,
      averagePrice: Number.parseFloat(formData.averagePrice) || Number.parseFloat(formData.price) || 0,
      annualDividend: formData.annualDividend ? Number.parseFloat(formData.annualDividend) : undefined,
      bankId: formData.bankId ? Number.parseInt(formData.bankId) : undefined,
    })
    onOpenChange(false)
  }

  // Visualizar apenas a busca (Passo 1)
  const showSearchOnly = !asset && !isManualMode

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground transition-theme max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {asset ? "Editar Ativo" : "Adicionar Ativo"}
            {!asset && !isManualMode && <Sparkles className="w-4 h-4 text-warning" />}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {asset
              ? "Atualize as informações do ativo"
              : showSearchOnly
                ? "Busque na Bolsa de Valores ou adicione manualmente"
                : "Insira as características da sua posição"}
          </DialogDescription>
        </DialogHeader>

        {showSearchOnly ? (
          <div className="py-4 space-y-4 flex flex-col min-h-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busque por Ticker ou Nome (ex: PETR4, Vale)"
                className="pl-9 bg-muted border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="flex-1 overflow-y-auto w-full space-y-2 max-h-[250px] pr-2 custom-scrollbar">
              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="text-center text-sm text-muted-foreground mt-8">
                  Nenhum ativo encontrado para "{searchQuery}"
                </div>
              )}

              {searchResults.map((result) => (
                <button
                  key={result.ticker}
                  onClick={() => handleSelectResult(result)}
                  className="w-full flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {result.logo ? (
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={result.logo} alt={result.ticker} className="w-6 h-6 object-contain" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {result.ticker.substring(0, 2)}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-bold text-sm text-foreground">{result.ticker}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm text-success">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.price || 0)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setIsManualMode(true)}
              >
                Não encontrou? Adicionar manualmente
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="custom-scrollbar pr-2 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-4 py-4">

              {formData.syncAvailable && (
                <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-md flex items-start gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Sincronização Ativa ({formData.ticker})</p>
                    <p className="text-xs opacity-80 mt-0.5">O preço deste ativo será atualizado automaticamente pelo Valore Sync.</p>
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-foreground font-medium">Nome do Ativo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Petrobras PN"
                  className="bg-muted border-border"
                  required
                  readOnly={formData.syncAvailable} // Impede alterar nome se estiver syncado, mantendo padrão Brapi
                />
              </div>

              {!formData.syncAvailable && (
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-foreground font-medium">Tipo de Ativo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as AssetType })}
                  >
                    <SelectTrigger id="type" className="bg-muted border-border">
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
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity" className="text-foreground font-medium">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.00000001"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Ex: 100"
                    className="bg-muted border-border"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-foreground font-medium">Preço Atual (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ex: 140.50"
                    className="bg-muted border-border"
                    required
                    readOnly={formData.syncAvailable}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="averagePrice" className="text-foreground font-medium">Preço Médio (R$)</Label>
                  <Input
                    id="averagePrice"
                    type="number"
                    step="0.01"
                    value={formData.averagePrice}
                    onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
                    placeholder="Quanto você pagou"
                    className="bg-muted border-border"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="annualDividend" className="text-foreground font-medium flex items-center gap-1.5">
                    Div. Anual/Cota (R$)
                    <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </Label>
                  <Input
                    id="annualDividend"
                    type="number"
                    step="0.01"
                    value={formData.annualDividend}
                    onChange={(e) => setFormData({ ...formData, annualDividend: e.target.value })}
                    placeholder="Calcula o YOC"
                    className="bg-muted border-border"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="targetPercentage" className="text-foreground font-medium">Meta de Alocação (%)</Label>
                <Input
                  id="targetPercentage"
                  type="number"
                  step="0.01"
                  value={formData.targetPercentage}
                  onChange={(e) => setFormData({ ...formData, targetPercentage: e.target.value })}
                  placeholder="Ex: 15"
                  className="bg-muted border-border"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bank" className="text-foreground font-medium">Custódia (Instituição)</Label>
                <Select
                  value={formData.bankId}
                  onValueChange={(value) => setFormData({ ...formData, bankId: value })}
                >
                  <SelectTrigger id="bank" className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="Opcional: Onde está investido?" />
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

            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!asset && formData.syncAvailable) {
                    // Volta para a busca se clicou errado
                    setIsManualMode(false)
                    setFormData({ ...formData, syncAvailable: false, ticker: "", name: "" })
                  } else {
                    onOpenChange(false)
                  }
                }}
                className="border-border text-foreground"
              >
                {!asset && formData.syncAvailable ? "Voltar à Busca" : "Cancelar"}
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-theme"
              >
                {asset ? "Salvar Alterações" : "Adicionar à Carteira"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

