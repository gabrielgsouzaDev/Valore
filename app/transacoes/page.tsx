"use client"

// React & Next.js
import { AnimatePresence, motion } from "framer-motion"

// Componentes Globais
import { EmptyState } from "@/components/empty-state"
import { DemoBanner } from "@/components/demo-banner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { OfxImporter } from "@/components/ofx-importer"

// Ícones
import { Plus, Receipt, Upload, Download, X, Check, Trash2, History, ListTodo } from "lucide-react"

// Utilitários
import { cn } from "@/lib/utils"

// Hook de Negócio
import { useTransactions } from "./hooks/useTransactions"

// Subcomponentes Atômicos
import { SummaryCards } from "./components/SummaryCards"
import { TransactionFilters } from "./components/TransactionFilters"
import { ProjectionChart } from "./components/ProjectionChart"
import { TransactionList } from "./components/TransactionList"
import { TransactionDialog } from "./components/TransactionDialog"

/**
 * Página de Transações Agendadas e Histórico.
 *
 * Componente de composição pura. Toda a lógica de negócio, filtros,
 * agrupamentos e handlers está encapsulada em `useTransactions`.
 */
export default function TransacoesPage() {
    const {
        activeTab, handleTabChange,
        form, setForm,
        editingId,
        dialogOpen, setDialogOpen,
        statusFilter, setStatusFilter,
        typeFilter, setTypeFilter,
        showFilters, setShowFilters,
        ofxOpen, setOfxOpen,
        periodFilter, setPeriodFilter,
        confirmOpen,
        isSubmitting,
        selectedIds,
        hasPayableInSelection,
        filteredAgendadas,
        groupedTransactions,
        agendadasSummary,
        projectionData,
        historyTransactions,
        historySummary,
        getBankById,
        getCategoryName,
        settings,
        banks,
        categories,
        handleSubmit,
        handleEdit,
        handleDeleteRequest,
        handleDeleteConfirm,
        toggleSelection,
        handleBatchPay,
        handleBatchDelete,
        handleExportCSV,
        markAsPaid,
    } = useTransactions()

    return (
        <div className="min-h-screen bg-background transition-theme pb-20 sm:pb-0">
            {/* Barra Flutuante de Ações em Lote */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, x: "-50%" }}
                        animate={{ y: 0, opacity: 1, x: "-50%" }}
                        exit={{ y: 100, opacity: 0, x: "-50%" }}
                        className="fixed bottom-6 left-1/2 bg-card border border-border shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-full px-6 py-3 flex items-center gap-4 z-50 backdrop-blur-xl w-[90%] sm:w-auto"
                    >
                        <span className="text-sm font-bold whitespace-nowrap">
                            {selectedIds.size} selecionada{selectedIds.size !== 1 && "s"}
                        </span>
                        <div className="w-px h-4 bg-border shrink-0" />
                        {hasPayableInSelection && (
                            <Button
                                variant="ghost" size="sm"
                                onClick={handleBatchPay}
                                className="text-success hover:text-success hover:bg-success/10 text-xs sm:text-sm h-8 rounded-full"
                            >
                                <Check className="w-4 h-4 mr-1 sm:mr-2" /> Pagar
                            </Button>
                        )}
                        <Button
                            variant="ghost" size="sm"
                            onClick={handleBatchDelete}
                            className="text-danger hover:text-danger hover:bg-danger/10 text-xs sm:text-sm h-8 rounded-full"
                        >
                            <Trash2 className="w-4 h-4 mr-1 sm:mr-2" /> Excluir
                        </Button>
                        <Button
                            variant="ghost" size="icon"
                            onClick={() => handleTabChange(activeTab)} // reset seleção sem mudar aba
                            className="text-muted-foreground h-8 w-8 rounded-full ml-auto"
                            aria-label="Cancelar seleção"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-30">
                <div className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Receipt className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Transações</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline" size="icon"
                            className="border-border bg-card/50 text-foreground hover:bg-muted"
                            onClick={handleExportCSV}
                            aria-label="Exportar transações como CSV"
                            title="Exportar CSV"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="border-border bg-card/50 text-foreground text-xs sm:text-sm font-semibold hover:bg-muted"
                            onClick={() => setOfxOpen(true)}
                        >
                            <Upload className="h-4 w-4 mr-2" /> Importar
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold shadow-lg shadow-primary/20"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Nova Transação
                        </Button>
                    </div>
                </div>
            </header>

            <DemoBanner />

            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <SummaryCards
                    income={activeTab === "agendadas" ? agendadasSummary.income : historySummary.income}
                    expenses={activeTab === "agendadas" ? agendadasSummary.expenses : historySummary.expenses}
                    balance={activeTab === "agendadas" ? agendadasSummary.balance : historySummary.balance}
                    activeTab={activeTab}
                    isPrivate={settings.isPrivate}
                />

                {/* Navegação por Abas */}
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl mb-6 w-full sm:w-auto sm:inline-flex">
                    <button
                        onClick={() => handleTabChange("agendadas")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none justify-center",
                            activeTab === "agendadas" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <ListTodo className="h-4 w-4" /> Agendadas
                    </button>
                    <button
                        onClick={() => handleTabChange("historico")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none justify-center",
                            activeTab === "historico" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <History className="h-4 w-4" /> Histórico
                    </button>
                </div>

                {activeTab === "agendadas" ? (
                    <div className="space-y-4">
                        <TransactionFilters
                            activeTab="agendadas"
                            filter={statusFilter}
                            setFilter={setStatusFilter}
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            periodFilter={periodFilter}
                            setPeriodFilter={setPeriodFilter}
                        />
                        <ProjectionChart data={projectionData} />
                        {filteredAgendadas.length === 0 ? (
                            <EmptyState
                                icon={ListTodo}
                                title="Nenhuma transação futura"
                                description="Suas contas a pagar e receber aparecerão aqui para ajudar você a prever seu saldo."
                                actionLabel="Adicionar Agora"
                                onAction={() => setDialogOpen(true)}
                            />
                        ) : (
                            <TransactionList
                                transactions={filteredAgendadas}
                                groupedTransactions={groupedTransactions}
                                getBankById={getBankById}
                                getCategoryName={getCategoryName}
                                onMarkAsPaid={markAsPaid}
                                onEdit={handleEdit}
                                onDelete={handleDeleteRequest}
                                selectedIds={selectedIds}
                                toggleSelection={toggleSelection}
                                isPrivate={settings.isPrivate}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <TransactionFilters
                            activeTab="historico"
                            filter={statusFilter}
                            setFilter={setStatusFilter}
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            periodFilter={periodFilter}
                            setPeriodFilter={setPeriodFilter}
                        />
                        {historyTransactions.length === 0 ? (
                            <EmptyState
                                icon={History}
                                title="Sem registros"
                                description="Marque transações agendadas como pagas para começar a construir seu histórico."
                            />
                        ) : (
                            <TransactionList
                                isHistory
                                transactions={historyTransactions}
                                getBankById={getBankById}
                                getCategoryName={getCategoryName}
                                onMarkAsPaid={markAsPaid}
                                onEdit={handleEdit}
                                onDelete={handleDeleteRequest}
                                selectedIds={selectedIds}
                                toggleSelection={toggleSelection}
                                isPrivate={settings.isPrivate}
                            />
                        )}
                    </div>
                )}
            </main>

            <TransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                form={form}
                setForm={setForm}
                editingId={editingId}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                banks={banks}
                categories={categories}
                onNewCategory={() => { }}
            />
            <OfxImporter open={ofxOpen} onOpenChange={setOfxOpen} />
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={() => { }}
                title="Excluir Transação?"
                description="Tem certeza? Esta transação será removida permanentemente do seu histórico."
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
