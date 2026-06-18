"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, Plus } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

interface InvestmentsHeaderProps {
    onAddAsset: () => void
}

export function InvestmentsHeader({ onAddAsset }: InvestmentsHeaderProps) {
    return (
        <PageHeader icon={TrendingUp} title="Investimentos">
            <Button onClick={onAddAsset} size="sm" className="font-semibold">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Ativo</span>
            </Button>
        </PageHeader>
    )
}
