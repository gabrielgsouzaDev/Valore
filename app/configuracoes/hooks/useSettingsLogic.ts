"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { appStorageSchema } from "@/lib/schemas"
import { migrateBackup } from "@/lib/services"
import type { InvestmentStrategy } from "@/lib/types"

/**
 * Hook customizado para centralizar a lógica complexa da página de Configurações.
 * Gerencia salvamento de perfil, portfólio, backup/import e estados de confirmação.
 */
export function useSettingsLogic() {
    const { toast } = useToast()
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

    // ── Estado Local (Buffered) ──────────────────────────────────────────────
    const [localSettings, setLocalSettings] = useState({
        nome: settings.nome,
        rendaMensal: settings.rendaMensal.toString(),
        capitalInvestido: settings.capitalInvestido.toString(),
        metaReservaEmergencia: settings.metaReservaEmergencia.toString(),
        investmentStrategy: settings.investmentStrategy || "rebalance",
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

    // ── Handlers de Campos ───────────────────────────────────────────────────
    const handleUpdateLocalSetting = (field: string, value: any) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }))
    }

    // ── Ações de Salvamento ──────────────────────────────────────────────────
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
        toast({ title: "Módulos atualizados" })
    }

    // ── Backup e Restore ─────────────────────────────────────────────────────
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

    // ── Diálogos ─────────────────────────────────────────────────────────────
    const openConfirm = (cfg: Partial<typeof confirmState>) => {
        setConfirmState(prev => ({ ...prev, ...cfg, isOpen: true }))
    }

    const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }))

    return {
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

        openConfirm,
        closeConfirm,
        setConfirmState
    }
}
