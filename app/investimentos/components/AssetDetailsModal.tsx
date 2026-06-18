"use client"

import { useIsMobile } from "@/components/ui/use-mobile"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { useAssetDetail } from "../hooks/useAssetDetail"
import { AssetDetailsContent, AssetDetailsHeader } from "./AssetDetailsContent"

interface AssetDetailsModalProps {
    assetId: number | null
    onClose: () => void
    isPrivate?: boolean
}

/**
 * AssetDetailsModal - Responsivo (Dialog em Desktop, Drawer em Mobile).
 * Isolado por ErrorBoundary para que falhas em dados de mercado não derrubem a página de investimentos.
 */
export function AssetDetailsModal({ assetId, onClose, isPrivate = false }: AssetDetailsModalProps) {
    const isMobile = useIsMobile()
    const { asset, marketData, isLoading, error } = useAssetDetail(assetId || 0)

    if (!assetId) return null
    const isOpen = !!assetId

    // Asset ainda não carregado do Dexie — mostra fallback
    if (!asset) {
        const fallback = (
            <ErrorBoundary moduleName="Detalhes do Ativo">
                <div className="p-10 flex justify-center text-muted-foreground">Carregando dados do ativo...</div>
            </ErrorBoundary>
        )
        if (isMobile) {
            return (
                <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
                    <DrawerContent className="bg-background border-t border-border max-h-[90vh]">
                        <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-3 mb-1" />
                        <DrawerHeader className="p-6 border-b border-border/50">{fallback}</DrawerHeader>
                    </DrawerContent>
                </Drawer>
            )
        }
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-md bg-background border-border shadow-2xl p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 bg-muted/30 border-b border-border/50">{fallback}</DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }

    const content = (
        <ErrorBoundary moduleName="Detalhes do Ativo">
            <AssetDetailsHeader
                asset={asset}
                marketData={marketData}
                isPrivate={isPrivate}
            />
            <div className="overflow-y-auto">
                <AssetDetailsContent
                    assetId={assetId}
                    asset={asset}
                    marketData={marketData}
                    isLoading={isLoading}
                    error={error}
                    isPrivate={isPrivate}
                />
            </div>
        </ErrorBoundary>
    )

    // ── Versão Mobile (Drawer) ────────────────────────────────────────────────
    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DrawerContent className="bg-background border-t border-border max-h-[90vh]">
                    <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mt-3 mb-1" />
                    <DrawerHeader className="p-6 border-b border-border/50">
                        {content}
                    </DrawerHeader>
                </DrawerContent>
            </Drawer>
        )
    }

    // ── Versão Desktop (Dialog) ───────────────────────────────────────────────
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-background border-border shadow-2xl p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 bg-muted/30 border-b border-border/50">
                    {content}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
