"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  Save,
  User,
  DollarSign,
  CheckCircle,
  Building2,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  PiggyBank,
  Smartphone,
  TrendingUp,
  Landmark,
  HelpCircle,
  Star,
  Link2,
  Palette,
  Check,
  FileJson,
  FileSpreadsheet,
  Zap,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { themePresets } from "@/lib/constants"
import type { Bank, BankType, ThemePreset } from "@/lib/types"
import { cn } from "@/lib/utils"

const bankTypes: { value: BankType; label: string; icon: React.ReactNode }[] = [
  { value: "conta_corrente", label: "Conta Corrente", icon: <Landmark className="h-4 w-4" /> },
  { value: "poupanca", label: "Poupança", icon: <PiggyBank className="h-4 w-4" /> },
  { value: "carteira_digital", label: "Carteira Digital", icon: <Wallet className="h-4 w-4" /> },
  { value: "corretora", label: "Corretora", icon: <TrendingUp className="h-4 w-4" /> },
  { value: "banco_digital", label: "Banco Digital", icon: <Smartphone className="h-4 w-4" /> },
  { value: "outro", label: "Outro", icon: <HelpCircle className="h-4 w-4" /> },
]

const bankColors = [
  { value: "violet", label: "Roxo", class: "bg-violet-500" },
  { value: "orange", label: "Laranja", class: "bg-orange-500" },
  { value: "emerald", label: "Verde", class: "bg-emerald-500" },
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "rose", label: "Rosa", class: "bg-rose-500" },
  { value: "cyan", label: "Ciano", class: "bg-cyan-500" },
  { value: "amber", label: "Âmbar", class: "bg-amber-500" },
  { value: "slate", label: "Cinza", class: "bg-slate-500" },
]

const getColorClass = (color: string) => {
  return bankColors.find((c) => c.value === color)?.class || "bg-slate-500"
}

const getBankTypeInfo = (type: BankType) => {
  return bankTypes.find((t) => t.value === type) || bankTypes[5]
}

export default function ConfiguracoesPage() {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    banks,
    addBank,
    updateBank,
    deleteBank,
    getLinkedItems,
    getTotalBankBalance,
    currentTheme,
    setTheme,
    clearAllData,
    loadExampleData,
  } = useApp()

  const [localSettings, setLocalSettings] = useState({
    nome: settings.nome,
    rendaMensal: settings.rendaMensal.toString(),
    capitalInvestido: settings.capitalInvestido.toString(),
    metaReservaEmergencia: settings.metaReservaEmergencia.toString(),
  })

  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [bankDialogOpen, setBankDialogOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [expandedBank, setExpandedBank] = useState<number | null>(null)

  const [bankForm, setBankForm] = useState({
    name: "",
    type: "banco_digital" as BankType,
    color: "violet",
    balance: 0,
    isMain: false,
    notes: "",
  })

  const handleSalvarPerfil = () => {
    updateSettings({
      nome: localSettings.nome,
      rendaMensal: Number.parseFloat(localSettings.rendaMensal) || 0,
    })
    setSaveStatus("perfil")
    setTimeout(() => setSaveStatus(null), 2000)
  }

  const handleSalvarPortfolio = () => {
    updateSettings({
      capitalInvestido: Number.parseFloat(localSettings.capitalInvestido) || 0,
      metaReservaEmergencia: Number.parseFloat(localSettings.metaReservaEmergencia) || 6,
    })
    setSaveStatus("portfolio")
    setTimeout(() => setSaveStatus(null), 2000)
  }

  const handleLimparDados = () => {
    const confirmed = window.confirm("Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.")
    if (confirmed) {
      clearAllData()
      setSaveStatus("limpo")
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }

  const handleImportarDados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const success = importData(event.target?.result as string)
      if (success) {
        setLocalSettings({
          nome: settings.nome,
          rendaMensal: settings.rendaMensal.toString(),
          capitalInvestido: settings.capitalInvestido.toString(),
          metaReservaEmergencia: settings.metaReservaEmergencia.toString(),
        })
        setSaveStatus("import")
        setTimeout(() => setSaveStatus(null), 2000)
      } else {
        alert("Erro ao importar dados. Verifique o arquivo.")
      }
    }
    reader.readAsText(file)
  }

  const openAddBankDialog = () => {
    setEditingBank(null)
    setBankForm({
      name: "",
      type: "banco_digital",
      color: "violet",
      balance: 0,
      isMain: false,
      notes: "",
    })
    setBankDialogOpen(true)
  }

  const openEditBankDialog = (bank: Bank) => {
    setEditingBank(bank)
    setBankForm({
      name: bank.name,
      type: bank.type,
      color: bank.color,
      balance: bank.balance,
      isMain: bank.isMain,
      notes: bank.notes || "",
    })
    setBankDialogOpen(true)
  }

  const handleSaveBank = () => {
    if (!bankForm.name) return

    if (editingBank) {
      updateBank(editingBank.id, bankForm)
    } else {
      addBank(bankForm)
    }
    setBankDialogOpen(false)
  }

  const handleDeleteBank = (id: number) => {
    const linked = getLinkedItems(id)
    const totalLinked =
      linked.assets.length + linked.goals.length + linked.transactions.length + linked.creditCards.length

    if (totalLinked > 0) {
      if (
        !confirm(
          `Este banco está vinculado a ${totalLinked} item(s). Excluir removerá todas as vinculações. Continuar?`,
        )
      ) {
        return
      }
    }
    deleteBank(id)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const totalBalance = getTotalBankBalance()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3 sm:py-4 pl-14 lg:pl-6">
            <h2 className="text-lg sm:text-2xl font-bold text-foreground">Configurações</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Ajuste as informações essenciais do sistema</p>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-4 sm:space-y-6">
              {/* Perfil */}
              <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    Perfil
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Informações pessoais básicas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="nome" className="text-foreground/80 text-xs sm:text-sm">
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      value={localSettings.nome}
                      onChange={(e) => setLocalSettings({ ...localSettings, nome: e.target.value })}
                      className="bg-muted border-border text-foreground text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="renda" className="text-foreground/80 text-xs sm:text-sm">
                      Renda Mensal (R$)
                    </Label>
                    <Input
                      id="renda"
                      type="number"
                      value={localSettings.rendaMensal}
                      onChange={(e) => setLocalSettings({ ...localSettings, rendaMensal: e.target.value })}
                      className="bg-muted border-border text-foreground text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleSalvarPerfil}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                  >
                    {saveStatus === "perfil" ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Salvo!
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Salvar Perfil
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                    Portfolio
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Configuracoes gerais de investimentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="capital" className="text-foreground/80 text-xs sm:text-sm">
                      Capital Investido Total (R$)
                    </Label>
                    <Input
                      id="capital"
                      type="number"
                      value={localSettings.capitalInvestido}
                      onChange={(e) => setLocalSettings({ ...localSettings, capitalInvestido: e.target.value })}
                      className="bg-muted border-border text-sm"
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="reserva" className="text-foreground/80 text-xs sm:text-sm">
                      Meta Reserva de Emergencia (meses)
                    </Label>
                    <Input
                      id="reserva"
                      type="number"
                      value={localSettings.metaReservaEmergencia}
                      onChange={(e) => setLocalSettings({ ...localSettings, metaReservaEmergencia: e.target.value })}
                      className="bg-muted border-border text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Recomendado: 6 meses</p>
                  </div>

                  <Button
                    onClick={handleSalvarPortfolio}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                  >
                    {saveStatus === "portfolio" ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Salvo!
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Temas */}
              <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                    <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                    Tema da Interface
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Escolha o visual do aplicativo</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {themePresets.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={cn(
                          "relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left group",
                          currentTheme.id === theme.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50",
                        )}
                        style={{
                          backgroundColor: `rgb(${theme.colors.background})`,
                        }}
                      >
                        <div className="flex gap-1 mb-2 sm:mb-3">
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                            style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                          />
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                            style={{ backgroundColor: `rgb(${theme.colors.accent})` }}
                          />
                          <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                            style={{ backgroundColor: `rgb(${theme.colors.card})` }}
                          />
                        </div>

                        <p
                          className="font-medium text-xs sm:text-sm truncate"
                          style={{ color: `rgb(${theme.colors.primary})` }}
                        >
                          {theme.name}
                        </p>
                        <p
                          className="text-[10px] sm:text-xs mt-0.5 line-clamp-1"
                          style={{ color: `rgb(${theme.colors.mutedForeground})` }}
                        >
                          {theme.description}
                        </p>

                        {currentTheme.id === theme.id && (
                          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-foreground text-base sm:text-lg">Backup & Dados</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Exporte ou importe seus dados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="space-y-2">
                    <Label className="text-foreground/80 text-xs sm:text-sm">Exportar Dados</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => exportData("json")}
                        variant="outline"
                        className="border-border text-foreground/80 hover:bg-muted hover:text-foreground bg-transparent text-xs sm:text-sm flex-1"
                      >
                        <FileJson className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        JSON
                      </Button>
                      <Button
                        onClick={() => exportData("csv")}
                        variant="outline"
                        className="border-border text-foreground/80 hover:bg-muted hover:text-foreground bg-transparent text-xs sm:text-sm flex-1"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        CSV
                      </Button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      JSON: backup completo para reimportar | CSV: visualizar em planilhas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground/80 text-xs sm:text-sm">Importar Dados</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        className="border-border text-foreground/80 hover:bg-muted hover:text-foreground bg-transparent text-xs sm:text-sm flex-1"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        {saveStatus === "import" ? "Importado!" : "Importar JSON"}
                      </Button>
                      <Button
                        variant="secondary"
                        className="bg-primary/20 text-primary hover:bg-primary/30 text-xs sm:text-sm flex-1 border border-primary/20"
                        onClick={() => {
                          if (confirm("Isso carregará dados fictícios para demonstração. Deseja continuar?")) {
                            loadExampleData()
                          }
                        }}
                      >
                        <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Modo Demo
                      </Button>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      onChange={handleImportarDados}
                      className="hidden"
                    />
                  </div>

                  <div className="border-t border-border pt-3 sm:pt-4">
                    <Label className="text-foreground/80 text-xs sm:text-sm">Zona de Perigo</Label>
                    <Button
                      onClick={handleLimparDados}
                      variant="outline"
                      className="border-danger text-danger hover:bg-danger/10 hover:text-danger bg-transparent text-xs sm:text-sm w-full sm:w-auto mt-2"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      {saveStatus === "limpo" ? "Dados Apagados!" : "Limpar Todos os Dados"}
                    </Button>
                    <p className="text-[10px] sm:text-xs text-danger/70 mt-2">
                      Atenção: Isto apagará permanentemente TODOS os seus dados locais.
                    </p>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-primary">
                      Dados salvos automaticamente no navegador (localStorage)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita - Bancos */}
            <div className="space-y-4 sm:space-y-6">
              <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        Bancos & Contas
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Gerencie suas instituicoes</CardDescription>
                    </div>
                    <Button
                      onClick={openAddBankDialog}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Novo</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-border/50">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Saldo Total</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
                  </div>

                  <div className="space-y-2 sm:space-y-3 max-h-96 sm:max-h-[500px] overflow-y-auto">
                    {banks.map((bank) => {
                      const linked = getLinkedItems(bank.id)
                      const totalLinked =
                        linked.assets.length +
                        linked.goals.length +
                        linked.transactions.length +
                        linked.creditCards.length
                      const typeInfo = getBankTypeInfo(bank.type)
                      const isExpanded = expandedBank === bank.id

                      return (
                        <div
                          key={bank.id}
                          className={cn(
                            "bg-muted/50 rounded-lg border transition-all",
                            bank.isMain ? "border-primary/50" : "border-border/50",
                          )}
                        >
                          <div
                            className="p-3 sm:p-4 cursor-pointer"
                            onClick={() => setExpandedBank(isExpanded ? null : bank.id)}
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white",
                                  getColorClass(bank.color),
                                )}
                              >
                                {typeInfo.icon}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className="font-medium text-foreground truncate text-sm">{bank.name}</span>
                                  {bank.isMain && (
                                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-current flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                                  <span className="truncate">{typeInfo.label}</span>
                                  {totalLinked > 0 && (
                                    <span className="flex items-center gap-0.5 text-accent flex-shrink-0">
                                      <Link2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                      {totalLinked}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <p className="font-semibold text-foreground text-sm">{formatCurrency(bank.balance)}</p>
                              </div>

                              <div className="flex gap-0.5 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-accent"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditBankDialog(bank)
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteBank(bank.id)
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {isExpanded && totalLinked > 0 && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-1.5 sm:pt-2 border-t border-border/50">
                              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 uppercase tracking-wide">
                                Vinculacoes
                              </p>
                              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                {linked.assets.length > 0 && (
                                  <div className="bg-background/50 rounded p-1.5 sm:p-2">
                                    <p className="text-muted-foreground text-[10px] sm:text-xs">Ativos</p>
                                    {linked.assets.map((a) => (
                                      <p key={a.id} className="text-foreground text-[10px] sm:text-xs truncate">
                                        {a.name}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {linked.goals.length > 0 && (
                                  <div className="bg-background/50 rounded p-1.5 sm:p-2">
                                    <p className="text-muted-foreground text-[10px] sm:text-xs">Objetivos</p>
                                    {linked.goals.map((g) => (
                                      <p key={g.id} className="text-foreground text-[10px] sm:text-xs truncate">
                                        {g.name}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {linked.transactions.length > 0 && (
                                  <div className="bg-background/50 rounded p-1.5 sm:p-2">
                                    <p className="text-muted-foreground text-[10px] sm:text-xs">Transacoes</p>
                                    {linked.transactions.slice(0, 3).map((t) => (
                                      <p key={t.id} className="text-foreground text-[10px] sm:text-xs truncate">
                                        {t.name}
                                      </p>
                                    ))}
                                    {linked.transactions.length > 3 && (
                                      <p className="text-muted-foreground text-[10px] sm:text-xs">
                                        +{linked.transactions.length - 3} mais
                                      </p>
                                    )}
                                  </div>
                                )}
                                {linked.creditCards.length > 0 && (
                                  <div className="bg-background/50 rounded p-1.5 sm:p-2">
                                    <p className="text-muted-foreground text-[10px] sm:text-xs">Cartoes</p>
                                    {linked.creditCards.map((c) => (
                                      <p key={c.id} className="text-foreground text-[10px] sm:text-xs truncate">
                                        {c.name}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {banks.length === 0 && (
                      <div className="text-center py-8">
                        <Building2 className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">Nenhum banco cadastrado</p>
                        <Button onClick={openAddBankDialog} variant="link" className="text-primary text-sm mt-2">
                          Adicionar primeiro banco
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Bank Dialog */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{editingBank ? "Editar Banco" : "Novo Banco"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Nome</Label>
              <Input
                value={bankForm.name}
                onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                placeholder="Nome do banco"
                className="bg-muted border-border text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Tipo</Label>
              <Select value={bankForm.type} onValueChange={(v) => setBankForm({ ...bankForm, type: v as BankType })}>
                <SelectTrigger className="bg-muted border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {bankTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-sm">
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Cor</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {bankColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setBankForm({ ...bankForm, color: color.value })}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all",
                      color.class,
                      bankForm.color === color.value && "ring-2 ring-white ring-offset-2 ring-offset-card",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Saldo Atual (R$)</Label>
              <Input
                type="number"
                value={bankForm.balance}
                onChange={(e) => setBankForm({ ...bankForm, balance: Number.parseFloat(e.target.value) || 0 })}
                className="bg-muted border-border text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="main-bank" className="text-xs sm:text-sm">
                Conta Principal
              </Label>
              <Switch
                id="main-bank"
                checked={bankForm.isMain}
                onCheckedChange={(v) => setBankForm({ ...bankForm, isMain: v })}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Observacoes</Label>
              <Textarea
                value={bankForm.notes}
                onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
                placeholder="Notas opcionais..."
                className="bg-muted border-border text-sm resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="border-border bg-transparent text-xs sm:text-sm">
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleSaveBank} className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
              {editingBank ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
