"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DemoBanner } from "@/components/demo-banner"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Settings, Download } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { appStorageSchema } from "@/lib/schemas"
import { migrateBackup, formatCurrency } from "@/lib/services"
import type { Bank, BankType, InvestmentStrategy } from "@/lib/types"
import { usePWA } from "@/hooks/use-pwa"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Local Atomic Components
import { ProfileSection } from "./components/ProfileSection"
import { PortfolioSection } from "./components/PortfolioSection"
import { BankManagement } from "./components/BankManagement"
import { ModuleToggles } from "./components/ModuleToggles"
import { AppearanceSection } from "./components/AppearanceSection"
import { DangerZone } from "./components/DangerZone"

function PWAInstallCard() {
  const { isInstallable, isIOSDevice, isStandalone, promptInstall } = usePWA()
  if (isStandalone || !isInstallable) return null
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold text-foreground">Instalar Aplicativo</p>
        {isIOSDevice ? (
          <p className="text-xs text-muted-foreground">Toque em Compartilhar → Adicionar à Tela de Início.</p>
        ) : (
          <p className="text-xs text-muted-foreground">Instale o Valore nativamente para rápido acesso.</p>
        )}
      </div>
      {!isIOSDevice && (
        <Button
          onClick={promptInstall}
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm w-full sm:w-auto shrink-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Instalar o Valore
        </Button>
      )}
    </div>
  )
}

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    description: string
    confirmLabel?: string
    variant?: "destructive" | "default"
    action: () => void
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => { },
  })

  const router = useRouter()
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    addBank,
    updateBank,
    deleteBank,
    setTheme,
    clearAllData,
    loadExampleData,
    totalNetWorth,
    currentTheme,
    banks
  } = useApp()

  const [localSettings, setLocalSettings] = useState({
    nome: settings.nome,
    rendaMensal: settings.rendaMensal.toString(),
    capitalInvestido: settings.capitalInvestido.toString(),
    metaReservaEmergencia: settings.metaReservaEmergencia.toString(),
    investmentStrategy: settings.investmentStrategy || "rebalance",
    userFocus: settings.userFocus || "both",
    activeModules: settings.activeModules || {
      investimentos: true,
      economia: true,
      objetivos: true,
      transacoes: true,
      cartoes: true,
    },
  })

  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdateLocalSetting = (field: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSalvarPerfil = async () => {
    setIsSubmitting(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      updateSettings({
        nome: localSettings.nome,
        rendaMensal: Number.parseFloat(localSettings.rendaMensal) || 0,
      })
      setSaveStatus("perfil")
      toast({ title: "Perfil salvo" })
      setTimeout(() => setSaveStatus(null), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSalvarPortfolio = async () => {
    setIsSubmitting(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      updateSettings({
        capitalInvestido: Number.parseFloat(localSettings.capitalInvestido) || 0,
        metaReservaEmergencia: Number.parseFloat(localSettings.metaReservaEmergencia) || 6,
        investmentStrategy: localSettings.investmentStrategy as InvestmentStrategy,
      })
      setSaveStatus("portfolio")
      toast({ title: "Portfolio salvo" })
      setTimeout(() => setSaveStatus(null), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleModule = (id: string, val: boolean) => {
    const updatedModules = { ...localSettings.activeModules, [id]: val }
    handleUpdateLocalSetting("activeModules", updatedModules)
    updateSettings({ activeModules: updatedModules })
    toast({ title: "Modulos atualizados" })
  }

  const handleFocusChange = (focus: string) => {
    handleUpdateLocalSetting("userFocus", focus)
    updateSettings({ userFocus: focus as any })
    toast({ title: "Foco atualizado" })
  }

  const handleImportarDados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target?.result as string)
        if (rawJson._app !== "valore") {
          toast({ title: "Arquivo inválido", variant: "destructive" })
          return
        }
        const migratedData = migrateBackup(rawJson, rawJson._version || 1)
        const validation = appStorageSchema.safeParse(migratedData)
        if (!validation.success) {
          toast({ title: "Backup corrompido", variant: "destructive" })
          return
        }
        const validData = validation.data
        setConfirmState({
          isOpen: true,
          title: "Importar Backup",
          description: "Isso substituirá todos os seus dados atuais. Continuar?",
          confirmLabel: "Importar",
          variant: "destructive",
          action: () => {
            importData(validData)
            setLocalSettings({
              nome: validData.settings.nome,
              rendaMensal: validData.settings.rendaMensal.toString(),
              capitalInvestido: validData.settings.capitalInvestido.toString(),
              metaReservaEmergencia: validData.settings.metaReservaEmergencia.toString(),
              investmentStrategy: validData.settings.investmentStrategy,
              userFocus: validData.settings.userFocus || "both",
              activeModules: validData.settings.activeModules || localSettings.activeModules
            })
            toast({ title: "Backup importado!" })
          }
        })
      } catch (err) {
        toast({ title: "Erro na leitura", variant: "destructive" })
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <>
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
        <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <div className="flex flex-col justify-center">
              <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Configurações</h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-80">
                Sistema • Preferências e Personalização
              </p>
            </div>
          </div>
        </div>
      </header>
      <DemoBanner />

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-4 sm:space-y-6">
            <ProfileSection
              nome={localSettings.nome}
              rendaMensal={localSettings.rendaMensal}
              onChange={handleUpdateLocalSetting}
              onSave={handleSalvarPerfil}
              isSubmitting={isSubmitting}
              saveStatus={saveStatus}
            />

            {localSettings.activeModules.investimentos && (
              <PortfolioSection
                totalNetWorth={totalNetWorth}
                metaReservaEmergencia={localSettings.metaReservaEmergencia}
                investmentStrategy={localSettings.investmentStrategy}
                onChange={handleUpdateLocalSetting}
                onSave={handleSalvarPortfolio}
                isSubmitting={isSubmitting}
                saveStatus={saveStatus}
                formatCurrency={formatCurrency}
              />
            )}

            <BankManagement
              banks={banks}
              onAddBank={addBank}
              onUpdateBank={updateBank}
              onDeleteBank={deleteBank}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Coluna Direita */}
          <div className="space-y-4 sm:space-y-6">
            <AppearanceSection
              currentTheme={currentTheme}
              setTheme={setTheme}
              userFocus={localSettings.userFocus}
              onFocusChange={handleFocusChange}
            />

            <ModuleToggles
              activeModules={localSettings.activeModules}
              onToggleModule={handleToggleModule}
            />

            <DangerZone
              onExportData={exportData}
              onImportData={handleImportarDados}
              onLoadDemoData={() => setConfirmState({
                isOpen: true,
                title: "Carregar Demo",
                description: "Isso substituirá seus dados atuais por dados de exemplo. Continuar?",
                action: () => { loadExampleData(); toast({ title: "Dados de demo carregados" }) }
              })}
              onResetOnboarding={() => setConfirmState({
                isOpen: true,
                title: "Reiniciar tour",
                description: "Deseja reiniciar o tour?",
                action: () => { updateSettings({ onboardingCompleted: false }); router.push("/") }
              })}
              onClearAllData={() => setConfirmState({
                isOpen: true,
                title: "Apagar tudo",
                description: "Cuidado! Isso apagará todos os dados.",
                variant: "destructive",
                action: () => { clearAllData(); toast({ title: "Dados apagados" }) }
              })}
              saveStatus={saveStatus}
            />

            <PWAInstallCard />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmState.isOpen}
        onOpenChange={(open) => setConfirmState({ ...confirmState, isOpen: open })}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.action}
      />
    </>
  )
}
