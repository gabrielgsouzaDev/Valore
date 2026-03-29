"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Download,
    Upload,
    RefreshCcw,
    Trash2,
    Smartphone,
    Sparkles,
    FileJson,
    FileSpreadsheet,
    AlertTriangle
} from "lucide-react"

interface DangerZoneProps {
    onExportData: () => void
    onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void
    onResetOnboarding: () => void
    onClearAllData: () => void
    saveStatus: string | null
}

export function DangerZone({
    onExportData,
    onImportData,
    onResetOnboarding,
    onClearAllData,
    saveStatus
}: DangerZoneProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="bg-card border-border">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                        <Download className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Exportar e Importar
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Gerencie seu backup (offline/local)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={onExportData}
                            className="bg-muted/50 border-border hover:bg-primary/10 hover:border-primary/30 text-xs h-auto py-3 sm:py-4 transition-all group"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <FileJson className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                <div className="text-center">
                                    <p className="font-bold">Exportar JSON</p>
                                    <p className="text-[10px] opacity-60">Backup universal</p>
                                </div>
                            </div>
                        </Button>

                        <div className="relative group">
                            <Input
                                type="file"
                                id="import-data"
                                accept=".json"
                                onChange={onImportData}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={() => document.getElementById("import-data")?.click()}
                                className="bg-muted/50 border-border hover:bg-primary/10 hover:border-primary/30 text-xs h-auto py-3 sm:py-4 transition-all w-full"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="font-bold">Importar JSON</p>
                                        <p className="text-[10px] opacity-60">Restaurar backup</p>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-danger/5 border-danger/20 border-l-4">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-danger text-base sm:text-lg">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                        Zona Crítica
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm opacity-80">Ações irreversíveis e sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 sm:p-6 pt-0 sm:pt-0">
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            onClick={onResetOnboarding}
                            className="justify-start border-border hover:bg-muted text-xs h-10 px-4"
                        >
                            <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Reiniciar Tour de Boas-vindas
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onClearAllData}
                            className="justify-start bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/20 text-xs h-10 px-4"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Apagar Todos os Dados
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
