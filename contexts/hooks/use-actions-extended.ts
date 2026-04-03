import { useCallback } from "react"
import { Goal, ScheduledTransaction, CreditCard, CardExpense, Bank, Asset, Category } from "@/lib/types"
import { generateId, calculateNextDate } from "@/lib/services"

export function useGoalActions(
  goals: Goal[],
  setGoalsState: React.Dispatch<React.SetStateAction<Goal[]>>
) {
  const addGoal = useCallback((goalData: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...goalData,
      id: generateId(goals),
    }
    setGoalsState((prev) => [...prev, newGoal])
  }, [goals, setGoalsState])

  const updateGoal = useCallback((id: number, data: Partial<Goal>) => {
    setGoalsState((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...data } : goal)))
  }, [setGoalsState])

  const deleteGoal = useCallback((id: number) => {
    setGoalsState((prev) => prev.filter((goal) => goal.id !== id))
  }, [setGoalsState])

  const addContributionToGoal = useCallback((goalId: number, amount: number) => {
    setGoalsState((prev) =>
      prev.map((goal) => (goal.id === goalId ? { ...goal, current: goal.current + amount } : goal)),
    )
  }, [setGoalsState])

  return { addGoal, updateGoal, deleteGoal, addContributionToGoal }
}

export function useTransactionActions(
  transactions: ScheduledTransaction[],
  setTransactionsState: React.Dispatch<React.SetStateAction<ScheduledTransaction[]>>,
  setCategoriesState: React.Dispatch<React.SetStateAction<Category[]>>
) {
  const addTransaction = useCallback((transactionData: Omit<ScheduledTransaction, "id">) => {
    const newTransaction: ScheduledTransaction = {
      ...transactionData,
      id: generateId(transactions),
    }
    setTransactionsState((prev) => [...prev, newTransaction])
  }, [transactions, setTransactionsState])

  const updateTransaction = useCallback((id: number, data: Partial<ScheduledTransaction>) => {
    setTransactionsState((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
  }, [setTransactionsState])

  const deleteTransaction = useCallback((id: number) => {
    setTransactionsState((prev) => prev.filter((t) => t.id !== id))
  }, [setTransactionsState])

  const markAsPaid = useCallback((id: number) => {
    setTransactionsState((prev) => {
      const transaction = prev.find((t) => t.id === id)
      if (!transaction) return prev

      const updated = prev.map((t) => (t.id === id ? { ...t, status: "pago" as const } : t))

      if (transaction.type === "pagamento" && transaction.categoryId) {
        setCategoriesState((catPrev) =>
          catPrev.map((cat) =>
            cat.id === transaction.categoryId ? { ...cat, spent: cat.spent + transaction.amount } : cat,
          ),
        )
      }

      if (transaction.recurrence !== "unico") {
        const nextDate = calculateNextDate(transaction.dueDate, transaction.recurrence)
        const newTransaction: ScheduledTransaction = {
          ...transaction,
          id: generateId(prev),
          dueDate: nextDate,
          status: "pendente" as const,
        }
        return [...updated, newTransaction]
      }
      return updated
    })
  }, [setTransactionsState, setCategoriesState])

  return { addTransaction, updateTransaction, deleteTransaction, markAsPaid }
}

export function useCardActions(
  creditCards: CreditCard[],
  setCreditCardsState: React.Dispatch<React.SetStateAction<CreditCard[]>>,
  cardExpenses: CardExpense[],
  setCardExpensesState: React.Dispatch<React.SetStateAction<CardExpense[]>>
) {
  const addCreditCard = useCallback((cardData: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      ...cardData,
      id: generateId(creditCards),
    }
    setCreditCardsState((prev) => [...prev, newCard])
  }, [creditCards, setCreditCardsState])

  const updateCreditCard = useCallback((id: number, data: Partial<CreditCard>) => {
    setCreditCardsState((prev) => prev.map((card) => (card.id === id ? { ...card, ...data } : card)))
  }, [setCreditCardsState])

  const deleteCreditCard = useCallback((id: number) => {
    setCreditCardsState((prev) => prev.filter((card) => card.id !== id))
    setCardExpensesState((prev) => prev.filter((expense) => expense.cardId !== id))
  }, [setCreditCardsState, setCardExpensesState])

  const addCardExpense = useCallback((expenseData: Omit<CardExpense, "id">) => {
    const newExpense: CardExpense = {
      ...expenseData,
      id: generateId(cardExpenses),
      paidInstallments: 0,
    }
    setCardExpensesState((prev) => [...prev, newExpense])
  }, [cardExpenses, setCardExpensesState])

  const updateCardExpense = useCallback((id: number, data: Partial<CardExpense>) => {
    setCardExpensesState((prev) => prev.map((expense) => (expense.id === id ? { ...expense, ...data } : expense)))
  }, [setCardExpensesState])

  const deleteCardExpense = useCallback((id: number) => {
    setCardExpensesState((prev) => prev.filter((expense) => expense.id !== id))
  }, [setCardExpensesState])

  return { addCreditCard, updateCreditCard, deleteCreditCard, addCardExpense, updateCardExpense, deleteCardExpense }
}

export function useBankActions(
  banks: Bank[],
  setBanksState: React.Dispatch<React.SetStateAction<Bank[]>>,
  setAssetsState: React.Dispatch<React.SetStateAction<Asset[]>>,
  setGoalsState: React.Dispatch<React.SetStateAction<Goal[]>>,
  setTransactionsState: React.Dispatch<React.SetStateAction<ScheduledTransaction[]>>,
  setCreditCardsState: React.Dispatch<React.SetStateAction<CreditCard[]>>
) {
  const addBank = useCallback((bankData: Omit<Bank, "id">) => {
    const newBank: Bank = {
      ...bankData,
      id: generateId(banks),
    }
    if (bankData.isMain) {
      setBanksState((prev) => prev.map((b) => ({ ...b, isMain: false })))
    }
    setBanksState((prev) => [...prev, newBank])
  }, [banks, setBanksState])

  const updateBank = useCallback((id: number, data: Partial<Bank>) => {
    if (data.isMain) {
      setBanksState((prev) => prev.map((b) => ({ ...b, isMain: b.id === id })))
    }
    setBanksState((prev) => prev.map((bank) => (bank.id === id ? { ...bank, ...data } : bank)))
  }, [setBanksState])

  const deleteBank = useCallback((id: number) => {
    setAssetsState((prev) => prev.map((a) => (a.bankId === id ? { ...a, bankId: undefined } : a)))
    setGoalsState((prev) => prev.map((g) => (g.bankId === id ? { ...g, bankId: undefined } : g)))
    setTransactionsState((prev) => prev.map((t) => (t.bankId === id ? { ...t, bankId: undefined } : t)))
    setCreditCardsState((prev) => prev.map((c) => (c.bankId === id ? { ...c, bankId: undefined } : c)))
    setBanksState((prev) => prev.filter((bank) => bank.id !== id))
  }, [setAssetsState, setGoalsState, setTransactionsState, setCreditCardsState, setBanksState])

  return { addBank, updateBank, deleteBank }
}
