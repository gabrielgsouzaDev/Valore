"use client"

import { DemoBanner } from "@/components/demo-banner"
import { Settings as SettingsIcon, Download } from "lucide-react"
import { useSettingsLogic } from "./hooks/useSettingsLogic"
import { formatCurrency } from "@/lib/services"
import { usePWA } from "@/hooks/use-pwa"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

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

/**
 * Página de Configurações
 * Refatorada para usar hooks customizados e composição de seções.
 */
export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const {
    localSettings,
    saveStatus,
    isSubmitting,
    confirmState,
    banks,
    totalNetWorth,
    currentTheme,
    handleUpdateLocalSetting,
    handleSalvarPerfil,
    handleSalvarPortfolio,
    handleToggleModule,
    handleImportarDados,
    exportData,
    addBank,
    updateBank,
    deleteBank,
    setTheme,
    clearAllData,
    loadExampleData,
    updateSettings,
    router,
    setConfirmState
  } = useSettingsLogic()

  return (
    <>
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30 transition-all duration-300">
        <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <div className="flex flex-col justify-center">
              <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Configurações</h2>
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
        onOpenChange={(open) => setConfirmState(prev => ({ ...prev, isOpen: open }))}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.action}
      />
    </>
  )
}
