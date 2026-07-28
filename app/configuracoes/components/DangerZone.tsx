"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    Database,
    Upload,
    Trash2,
    Sparkles,
    FileJson,
    AlertTriangle,
} from "lucide-react"

interface DangerZoneProps {
    onExportData: () => void
    onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void
    onClearAllData: () => void
    onLoadDemoData?: () => void
    saveStatus: string | null
}

/**
 * Linha de ação padronizada — mesmo idioma visual das demais seções de Config
 * (ver ModuleToggles): container `rounded-xl` com chip de ícone à esquerda,
 * título + descrição, e a ação à direita. `tone="danger"` tinge apenas a linha,
 * evitando que o card inteiro destoe do restante da página.
 */
function ActionRow({
    icon,
    title,
    description,
    action,
    tone = "neutral",
}: {
    icon: ReactNode
    title: string
    description: string
    action: ReactNode
    tone?: "neutral" | "danger"
}) {
    return (
        <div className={cn(
            "flex items-center justify-between gap-3 p-3 rounded-xl border",
            tone === "danger" ? "bg-danger/5 border-danger/20" : "bg-muted/30 border-border"
        )}>
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    tone === "danger" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"
                )}>
                    {icon}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-foreground truncate">{title}</span>
                    <span className="text-[11px] text-muted-foreground leading-tight">{description}</span>
                </div>
            </div>
            <div className="shrink-0">{action}</div>
        </div>
    )
}

export function DangerZone({
    onExportData,
    onImportData,
    onClearAllData,
    onLoadDemoData,
}: DangerZoneProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* ── Backup e Dados ─────────────────────────────────────────────── */}
            <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                        <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                        Backup e Dados
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Tudo local e offline no seu dispositivo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6 pt-0 sm:pt-0">
                    <ActionRow
                        icon={<FileJson className="h-4 w-4" />}
                        title="Exportar dados"
                        description="Baixa um backup universal em JSON"
                        action={
                            <Button variant="outline" size="sm" onClick={onExportData} className="h-8 text-xs font-bold">
                                Exportar
                            </Button>
                        }
                    />

                    <ActionRow
                        icon={<Upload className="h-4 w-4" />}
                        title="Importar dados"
                        description="Restaura a partir de um backup JSON"
                        action={
                            <>
                                <Input
                                    type="file"
                                    id="import-data"
                                    accept=".json"
                                    onChange={onImportData}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById("import-data")?.click()}
                                    className="h-8 text-xs font-bold"
                                >
                                    Importar
                                </Button>
                            </>
                        }
                    />

                    {onLoadDemoData && (
                        <ActionRow
                            icon={<Sparkles className="h-4 w-4" />}
                            title="Dados de demonstração"
                            description="Preenche o app com dados de exemplo"
                            action={
                                <Button variant="outline" size="sm" onClick={onLoadDemoData} className="h-8 text-xs font-bold">
                                    Carregar
                                </Button>
                            }
                        />
                    )}
                </CardContent>
            </Card>

            {/* ── Zona Crítica ───────────────────────────────────────────────── */}
            <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
                        Zona Crítica
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Ações irreversíveis — use com cuidado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6 pt-0 sm:pt-0">
                    <ActionRow
                        tone="danger"
                        icon={<Trash2 className="h-4 w-4" />}
                        title="Apagar todos os dados"
                        description="Remove tudo permanentemente, sem volta"
                        action={
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={onClearAllData}
                                className="h-8 text-xs font-bold bg-danger text-white hover:bg-danger/90"
                            >
                                Apagar
                            </Button>
                        }
                    />
                </CardContent>
            </Card>
        </div>
    )
}
