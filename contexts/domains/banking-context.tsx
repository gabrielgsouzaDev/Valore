"use client"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { Asset, Goal, ScheduledTransaction, CreditCard, CardExpense, Bank, InvoiceProjection } from "@/lib/types"
import { calculateInvoices as calculateInvoicesUtil } from "@/lib/services"
import { useCardActions, useBankActions } from "@/contexts/hooks/use-actions-extended"
import { useData } from "./data-context"

type BankingContextType = {
  banks: Bank[]
  setBanks: (banks: Bank[]) => void
  addBank: (bank: Omit<Bank, "id">) => Promise<void>
  updateBank: (id: number, data: Partial<Bank>) => Promise<void>
  deleteBank: (id: number) => Promise<void>
  creditCards: CreditCard[]
  setCreditCards: (cards: CreditCard[]) => void
  addCreditCard: (card: Omit<CreditCard, "id">) => Promise<void>
  updateCreditCard: (id: number, data: Partial<CreditCard>) => Promise<void>
  deleteCreditCard: (id: number) => Promise<void>
  cardExpenses: CardExpense[]
  setCardExpenses: (expenses: CardExpense[]) => void
  addCardExpense: (expense: Omit<CardExpense, "id">) => Promise<void>
  updateCardExpense: (id: number, data: Partial<CardExpense>) => Promise<void>
  deleteCardExpense: (id: number) => Promise<void>
  getBankById: (id: number) => Bank | undefined
  getTotalBankBalance: () => number
  calculateInvoices: (cardId?: number) => InvoiceProjection[]
  getTotalCardDebt: () => number
  getCardAvailableLimit: (cardId: number) => number
}

const BankingContext = createContext<BankingContextType | undefined>(undefined)

export function BankingProvider({ children }: { children: React.ReactNode }) {
  const { banks, creditCards, cardExpenses } = useData()
  const [banksState, setBanksState] = useState<Bank[]>([])
  const [cardsState, setCardsState] = useState<CreditCard[]>([])
  const [expensesState, setExpensesState] = useState<CardExpense[]>([])

  const { addBank, updateBank, deleteBank } = useBankActions(
    banks, setBanksState, setAssetsStateNoop, setGoalsStateNoop, setTransactionsStateNoop, setCardsState
  )
  const { addCreditCard, updateCreditCard, deleteCreditCard, addCardExpense, updateCardExpense, deleteCardExpense } = useCardActions(
    creditCards, setCardsState, cardExpenses, setExpensesState
  )

  // No-op placeholders (setters exist for API compat only; Dexie writes through useLiveQuery)
  const setBanks = useCallback(() => {}, [])
  const setCreditCards = useCallback(() => {}, [])
  const setCardExpenses = useCallback(() => {}, [])

  const getBankById = useCallback((id: number) => banks.find(b => b.id === id), [banks])
  const getTotalBankBalance = useCallback(() => banks.reduce((sum: number, bank: Bank) => sum + bank.balance, 0), [banks])

  const calculateInvoices = useCallback((cardId?: number) => calculateInvoicesUtil(cardExpenses, creditCards, cardId), [cardExpenses, creditCards])

  const getTotalCardDebt = useCallback(() => {
    return cardExpenses.reduce((sum: number, expense: CardExpense) => {
      const remainingInstallments = expense.installments - (expense.paidInstallments || 0)
      const installmentValue = expense.totalAmount / expense.installments
      return sum + remainingInstallments * installmentValue
    }, 0)
  }, [cardExpenses])

  const getCardAvailableLimit = useCallback((cardId: number) => {
    const card = creditCards.find((c: CreditCard) => c.id === cardId)
    if (!card) return 0
    const invoices = calculateInvoices(cardId)
    const nextInvoice = invoices[0]?.total || 0
    return card.limit - nextInvoice
  }, [creditCards, calculateInvoices])

  const value = useMemo(() => ({
    banks, setBanks, addBank, updateBank, deleteBank,
    creditCards, setCreditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    cardExpenses, setCardExpenses, addCardExpense, updateCardExpense, deleteCardExpense,
    getBankById, getTotalBankBalance,
    calculateInvoices, getTotalCardDebt, getCardAvailableLimit,
  }), [
    banks, addBank, updateBank, deleteBank,
    creditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    cardExpenses, addCardExpense, updateCardExpense, deleteCardExpense,
    getBankById, getTotalBankBalance,
    calculateInvoices, getTotalCardDebt, getCardAvailableLimit,
  ])

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>
}

// No-op setter references for useBankActions cross-domain cascade
const setAssetsStateNoop: React.Dispatch<React.SetStateAction<Asset[]>> = () => {}
const setGoalsStateNoop: React.Dispatch<React.SetStateAction<Goal[]>> = () => {}
const setTransactionsStateNoop: React.Dispatch<React.SetStateAction<ScheduledTransaction[]>> = () => {}

export function useBanking() {
  const ctx = useContext(BankingContext)
  if (!ctx) throw new Error("useBanking deve ser utilizado dentro de um BankingProvider")
  return ctx
}
