"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Save, CheckCircle, Loader2 } from "lucide-react"

interface ProfileSectionProps {
    nome: string
    rendaMensal: string
    onChange: (field: string, value: string) => void
    onSave: () => void
    isSubmitting: boolean
    saveStatus: string | null
}

export function ProfileSection({
    nome,
    rendaMensal,
    onChange,
    onSave,
    isSubmitting,
    saveStatus
}: ProfileSectionProps) {
    return (
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
                        value={nome}
                        onChange={(e) => onChange("nome", e.target.value)}
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
                        value={rendaMensal}
                        onChange={(e) => onChange("rendaMensal", e.target.value)}
                        className="bg-muted border-border text-foreground text-sm"
                    />
                </div>

                <Button
                    onClick={onSave}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm min-w-[120px]"
                >
                    {isSubmitting && saveStatus === "perfil" ? (
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    ) : saveStatus === "perfil" ? (
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
    )
}
