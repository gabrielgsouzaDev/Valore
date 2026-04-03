"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/services"
import type { Asset } from "@/lib/types"

interface TaxReportProps {
    assets: Asset[]
}

export function TaxReport({ assets }: TaxReportProps) {
    const currentYear = new Date().getFullYear()

    return (
        <Card id="tax-report-print" className="bg-card border-border shadow-sm overflow-hidden">
            <style jsx global>{`
                @media print {
                    body {
                        visibility: hidden;
                        background: white !important;
                    }
                    #tax-report-print, #tax-report-print * {
                        visibility: visible;
                    }
                    #tax-report-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
            <CardHeader className="bg-muted/30 border-b border-border p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-foreground text-lg font-black uppercase tracking-tight italic">
                            <FileText className="h-5 w-5 text-primary" />
                            Relatório de Bens e Direitos
                        </CardTitle>
                        <CardDescription>Dados para Declaração de Imposto de Renda</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase" onClick={() => window.print()}>
                        <Download className="h-3 w-3 mr-1" /> PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border">
                                <TableHead className="text-[10px] uppercase font-black tracking-widest px-4">Ativo</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest px-4 text-center">Tipo</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest px-4 text-center">Qtd.</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest px-4 text-right">Custo Médio</TableHead>
                                <TableHead className="text-[10px] uppercase font-black tracking-widest px-4 text-right">Total (Bens)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">Nenhum ativo para reportar</TableCell>
                                </TableRow>
                            ) : (
                                assets.map((asset) => (
                                    <TableRow key={asset.id} className="border-border/50">
                                        <TableCell className="font-bold text-sm px-4">
                                            {asset.name}
                                            {asset.ticker && <span className="block text-[10px] font-normal text-muted-foreground">{asset.ticker}</span>}
                                        </TableCell>
                                        <TableCell className="text-center text-xs px-4">{asset.type}</TableCell>
                                        <TableCell className="text-center text-xs font-mono px-4">{asset.quantity}</TableCell>
                                        <TableCell className="text-right text-xs px-4">{formatCurrency(asset.averagePrice)}</TableCell>
                                        <TableCell className="text-right font-black text-sm px-4">
                                            {formatCurrency(asset.quantity * asset.averagePrice)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 bg-primary/5 border-t border-border">
                    <div className="flex items-center gap-3">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            <span className="font-bold text-foreground block uppercase mb-1">Dica de Declaração:</span>
                            Utilize o valor da coluna <span className="text-foreground font-bold">Total (Bens)</span> no campo "Situação em 31/12" do seu programa de IR. O custo de aquisição é o valor historicamente pago.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
