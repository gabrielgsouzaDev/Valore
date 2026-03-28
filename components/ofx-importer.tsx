"use client"

import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle2, AlertCircle, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { parseStatement, ParsedTransaction } from "@/lib/ofx-parser"

interface OfxImporterProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function OfxImporter({ open, onOpenChange }: OfxImporterProps) {
    const { addTransaction, transactions } = useApp()
    const [isDragging, setIsDragging] = useState(false)
    const [parsedData, setParsedData] = useState<ParsedTransaction[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [error, setError] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const processFile = async (file: File) => {
        setError(null)
        const fileName = file.name.toLowerCase()
        if (!fileName.endsWith('.ofx') && !fileName.endsWith('.csv')) {
            setError("Por favor, envie apenas arquivos no formato OFX ou CSV.")
            return
        }

        try {
            const text = await file.text()
            const data = parseStatement(text, fileName)

            if (data.length === 0) {
                setError("Não foi possível encontrar transações válidas neste arquivo.")
                return
            }

            // Detect duplicates heuristically
            const newTransactions = data.map((t: ParsedTransaction) => {
                const isDuplicate = transactions.some(existing =>
                    existing.amount === t.amount &&
                    existing.dueDate.split('T')[0] === t.date.toISOString().split('T')[0]
                )
                return { ...t, isDuplicate }
            })

            setParsedData(newTransactions)

            // Select non-duplicates by default
            const initialSelected = new Set<string>()
            newTransactions.forEach((t: ParsedTransaction & { isDuplicate?: boolean }) => {
                if (!t.isDuplicate) initialSelected.add(t.id)
            })
            setSelectedIds(initialSelected)

        } catch (err) {
            console.error(err)
            setError("Falha ao ler o arquivo. Certifique-se de que é um extrato válido.")
        }
    }

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = () => setIsDragging(false)

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleImport = () => {
        const toImport = parsedData.filter(t => selectedIds.has(t.id))

        toImport.forEach(t => {
            addTransaction({
                name: t.description,
                amount: Math.abs(t.amount),
                type: t.amount >= 0 ? "ganho" : "pagamento",
                status: "pago",
                dueDate: t.date.toISOString(),
                recurrence: "unico",
            })
        })

        resetAndClose()
    }

    const resetAndClose = () => {
        setParsedData([])
        setSelectedIds(new Set())
        setError(null)
        onOpenChange(false)
    }

    const toggleSelection = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) resetAndClose() }}>
            <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Upload className="w-5 h-5" /> Importar Extrato
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Sincronize transações enviando o arquivo OFX ou CSV exportado pelo seu banco.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-danger/10 text-danger border border-danger/20 p-3 rounded-md flex items-center gap-2 text-sm mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {parsedData.length === 0 ? (
                    <div
                        className={`mt-4 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-border hover:bg-muted/50'}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept=".ofx,.csv"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => e.target.files && processFile(e.target.files[0])}
                        />
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-lg mb-1">Clique ou Arraste o extrato</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px]">
                            Arquivos .OFX ou .CSV do Inter, Mercado Pago, Itaú, Nubank e outros.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 flex flex-col min-h-0 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{parsedData.length} transações encontradas</p>
                            <p className="text-sm text-muted-foreground">{selectedIds.size} selecionadas</p>
                        </div>

                        <div className="border border-border rounded-lg overflow-y-auto custom-scrollbar flex-1">
                            {parsedData.map((t, index) => (
                                <div
                                    key={t.id}
                                    className={`flex items-center justify-between p-3 border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors
                    ${index === parsedData.length - 1 ? 'border-0' : ''}
                    ${(t as any).isDuplicate ? 'opacity-60' : ''}`}
                                    onClick={() => toggleSelection(t.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            className={`w-5 h-5 rounded flex items-center justify-center border shrink-0
                        ${selectedIds.has(t.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}
                                        >
                                            {selectedIds.has(t.id) && <Check className="w-3 h-3" />}
                                        </button>
                                        <div>
                                            <p className="text-sm font-medium line-clamp-1">{t.description}</p>
                                            <div className="flex items-center gap-2 text-xs mt-0.5">
                                                <span className="text-muted-foreground">{new Intl.DateTimeFormat('pt-BR').format(t.date)}</span>
                                                {(t as any).isDuplicate && (
                                                    <span className="bg-warning/20 text-warning px-1.5 rounded-sm flex items-center gap-1 font-medium">
                                                        <AlertCircle className="w-3 h-3" /> Provável duplicata
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-semibold shrink-0 ml-2 ${t.amount >= 0 ? 'text-success' : 'text-foreground'}`}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-6 pt-2 border-t border-border">
                    <Button variant="ghost" onClick={resetAndClose}>
                        {parsedData.length > 0 ? "Cancelar" : "Fechar"}
                    </Button>
                    {parsedData.length > 0 && (
                        <Button onClick={handleImport} disabled={selectedIds.size === 0}>
                            Importar {selectedIds.size} Transaç{selectedIds.size === 1 ? 'ão' : 'ões'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
