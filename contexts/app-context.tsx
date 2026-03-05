"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  Asset, Category, Goal, Settings, ScheduledTransaction,
  CreditCard, CardExpense, InvoiceProjection, Bank, ThemePreset, Subcategory, PatrimonialSnapshot
} from "@/lib/types"
import {
  themePresets, defaultSettings, defaultAssets, defaultCategories,
  defaultGoals, defaultTransactions, defaultCreditCards, defaultCardExpenses,
  defaultBanks, STORAGE_KEY, exampleData
} from "@/lib/constants"
import { calculateInvoices as calculateInvoicesUtil, applyThemeVariables } from "@/lib/services"
import "jspdf-autotable"

/**
 * Interface que define o formato de dados e funções expostas pelo contexto global da aplicação.
 */
type AppContextType = {
  // Ativos (Investimentos)
  assets: Asset[]
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Omit<Asset, "id" | "currentValue">) => void
  updateAsset: (id: number, data: Partial<Asset>) => void
  deleteAsset: (id: number) => void

  // Categorias (Orçamento)
  categories: Category[]
  setCategories: (categories: Category[]) => void
  addCategory: (category: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => void
  updateCategory: (id: number, data: Partial<Category>) => void
  deleteCategory: (id: number) => void
  addSubcategory: (categoryId: number, subcategory: Omit<Subcategory, "id">) => void
  updateSubcategory: (categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => void
  deleteSubcategory: (categoryId: number, subcategoryId: number) => void
  toggleCategory: (id: number) => void

  // Metas (Objetivos de Curto/Longo Prazo)
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Omit<Goal, "id">) => void
  updateGoal: (id: number, data: Partial<Goal>) => void
  deleteGoal: (id: number) => void
  addContributionToGoal: (goalId: number, amount: number) => void

  // Transações Agendadas
  transactions: ScheduledTransaction[]
  setTransactions: (transactions: ScheduledTransaction[]) => void
  addTransaction: (transaction: Omit<ScheduledTransaction, "id">) => void
  updateTransaction: (id: number, data: Partial<ScheduledTransaction>) => void
  deleteTransaction: (id: number) => void
  markAsPaid: (id: number) => void

  // Cartões de Crédito
  creditCards: CreditCard[]
  setCreditCards: (cards: CreditCard[]) => void
  addCreditCard: (card: Omit<CreditCard, "id">) => void
  updateCreditCard: (id: number, data: Partial<CreditCard>) => void
  deleteCreditCard: (id: number) => void

  // Despesas de Cartão
  cardExpenses: CardExpense[]
  setCardExpenses: (expenses: CardExpense[]) => void
  addCardExpense: (expense: Omit<CardExpense, "id">) => void
  updateCardExpense: (id: number, data: Partial<CardExpense>) => void
  deleteCardExpense: (id: number) => void

  // Bancos e Contas
  banks: Bank[]
  setBanks: (banks: Bank[]) => void
  addBank: (bank: Omit<Bank, "id">) => void
  updateBank: (id: number, data: Partial<Bank>) => void
  deleteBank: (id: number) => void
  getBankById: (id: number) => Bank | undefined
  getTotalBankBalance: () => number
  getLinkedItems: (bankId: number) => {
    assets: Asset[]
    goals: Goal[]
    transactions: ScheduledTransaction[]
    creditCards: CreditCard[]
  }

  // Histórico
  patrimonialHistory: PatrimonialSnapshot[]
  savePatrimonialSnapshot: () => void

  // Cálculos de Cartão
  calculateInvoices: (cardId?: number) => InvoiceProjection[]
  getTotalCardDebt: () => number
  getCardAvailableLimit: (cardId: number) => number

  // Configurações e Temas
  settings: Settings
  updateSettings: (data: Partial<Settings>) => void
  currentTheme: ThemePreset
  setTheme: (themeId: string) => void

  // Valores Computados
  totalNetWorth: number
  totalBudgeted: number
  totalSpent: number
  availableForInvestment: number
  monthlyScheduledIncome: number
  monthlyScheduledExpenses: number
  upcomingTransactions: ScheduledTransaction[]

  // Utilitários de Dados
  exportData: (format: "json" | "csv") => void
  importData: (data: string) => boolean
  clearAllData: () => void
  loadExampleData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

/**
 * Provider principal da aplicação. Centraliza o estado e a persistência.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  // --- Estado ---
  const [isLoaded, setIsLoaded] = useState(false)
  const [assets, setAssetsState] = useState<Asset[]>(defaultAssets)
  const [categories, setCategoriesState] = useState<Category[]>(defaultCategories)
  const [goals, setGoalsState] = useState<Goal[]>(defaultGoals)
  const [settings, setSettingsState] = useState<Settings>(defaultSettings)
  const [transactions, setTransactionsState] = useState<ScheduledTransaction[]>(defaultTransactions)
  const [creditCards, setCreditCardsState] = useState<CreditCard[]>(defaultCreditCards)
  const [cardExpenses, setCardExpensesState] = useState<CardExpense[]>(defaultCardExpenses)
  const [banks, setBanksState] = useState<Bank[]>(defaultBanks)
  const [patrimonialHistory, setPatrimonialHistory] = useState<PatrimonialSnapshot[]>([])

  // --- Temas ---
  const initialTheme = themePresets.find((t: ThemePreset) => t.id === defaultSettings.themeId) || themePresets[0]
  const currentTheme = themePresets.find((t: ThemePreset) => t.id === settings.themeId) || initialTheme

  const setTheme = (themeId: string) => {
    setSettingsState((prev: Settings) => ({ ...prev, themeId }))
    const theme = themePresets.find((t: ThemePreset) => t.id === themeId) || initialTheme
    applyThemeVariables(theme)
  }

  // --- Valores Computados ---
  const totalNetWorth = assets.reduce((sum: number, asset: Asset) => sum + asset.currentValue, 0)
  const totalBudgeted = categories.reduce((sum: number, cat: Category) => sum + cat.budgeted, 0)
  const totalSpent = categories.reduce((sum: number, cat: Category) => sum + cat.spent, 0)

  const investmentCategory = categories.find((c: Category) => c.name === "Investimentos")
  const availableForInvestment = investmentCategory ? investmentCategory.budgeted - investmentCategory.spent : 0

  const monthlyScheduledIncome = transactions
    .filter((t: ScheduledTransaction) => t.type === "ganho" && (t.recurrence === "mensal" || t.recurrence === "unico"))
    .reduce((sum: number, t: ScheduledTransaction) => sum + t.amount, 0)

  const monthlyScheduledExpenses = transactions
    .filter((t: ScheduledTransaction) => t.type === "pagamento" && (t.recurrence === "mensal" || t.recurrence === "unico"))
    .reduce((sum: number, t: ScheduledTransaction) => sum + t.amount, 0)

  const upcomingTransactions = transactions
    .filter((t: ScheduledTransaction) => t.status === "pendente")
    .sort((a: ScheduledTransaction, b: ScheduledTransaction) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  // --- Persistência (LocalStorage) ---
  useEffect(() => {
    try {
      const savedData = window.localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.assets) setAssetsState(parsed.assets)
        if (parsed.categories) setCategoriesState(parsed.categories)
        if (parsed.goals) setGoalsState(parsed.goals)
        if (parsed.settings) {
          setSettingsState(parsed.settings)
          setTimeout(() => {
            const theme = themePresets.find((t: ThemePreset) => t.id === parsed.settings.themeId) || initialTheme
            applyThemeVariables(theme)
          }, 0)
        }
        if (parsed.transactions) setTransactionsState(parsed.transactions)
        if (parsed.creditCards) setCreditCardsState(parsed.creditCards)
        if (parsed.cardExpenses) setCardExpensesState(parsed.cardExpenses)
        if (parsed.banks) setBanksState(parsed.banks)
        if (parsed.patrimonialHistory) setPatrimonialHistory(parsed.patrimonialHistory)
      } else {
        // Carregar dados de exemplo por padrão no primeiro acesso
        setAssetsState(exampleData.assets)
        setCategoriesState(exampleData.categories)
        setGoalsState(exampleData.goals)
        setTransactionsState(exampleData.transactions)
        setCreditCardsState(exampleData.creditCards)
        setCardExpensesState(exampleData.cardExpenses)
        setBanksState(exampleData.banks)

        // Aplicar o tema padrão (Golden Hour)
        applyThemeVariables(initialTheme)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      applyThemeVariables(initialTheme)
    }
    setIsLoaded(true)
  }, [initialTheme])

  useEffect(() => {
    if (!isLoaded) return
    try {
      const dataToSave = {
        assets, categories, goals, settings, transactions,
        creditCards, cardExpenses, banks, patrimonialHistory,
        lastUpdated: new Date().toISOString(),
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    }
  }, [assets, categories, goals, settings, transactions, creditCards, cardExpenses, banks, patrimonialHistory, isLoaded])

  // --- Histórico Patrimonial ---
  const savePatrimonialSnapshot = () => {
    const today = new Date().toISOString().split("T")[0]
    setPatrimonialHistory((prev: PatrimonialSnapshot[]) => {
      const historyWithoutToday = prev.filter((s: PatrimonialSnapshot) => s.date !== today)
      return [...historyWithoutToday, { date: today, totalNetWorth }]
    })
  }

  // --- Snapshot Automático ---
  useEffect(() => {
    if (!isLoaded || totalNetWorth === 0) return

    const today = new Date().toISOString().split("T")[0]
    const hasTodaySnapshot = patrimonialHistory.some((s: PatrimonialSnapshot) => s.date === today)

    if (!hasTodaySnapshot) {
      savePatrimonialSnapshot()
    } else if (patrimonialHistory.length > 0) {
      const todaySnapshot = patrimonialHistory.find((s: PatrimonialSnapshot) => s.date === today)
      if (todaySnapshot && Math.abs(todaySnapshot.totalNetWorth - totalNetWorth) > 0.01) {
        savePatrimonialSnapshot()
      }
    }
  }, [totalNetWorth, isLoaded])

  // --- Funções de Ativos ---
  const setAssets = (newAssets: Asset[]) => setAssetsState(newAssets)

  const addAsset = (assetData: Omit<Asset, "id" | "currentValue">) => {
    const newAsset: Asset = {
      ...assetData,
      id: Math.max(...assets.map((a: Asset) => a.id), 0) + 1,
      currentValue: assetData.quantity * assetData.price,
      lastUpdated: new Date().toISOString(),
    }
    setAssetsState((prev: Asset[]) => [...prev, newAsset])
  }

  const updateAsset = (id: number, data: Partial<Asset>) => {
    setAssetsState((prev: Asset[]) =>
      prev.map((asset: Asset) => {
        if (asset.id === id) {
          const updated = { ...asset, ...data }
          if (data.quantity !== undefined || data.price !== undefined) {
            updated.currentValue = (data.quantity ?? asset.quantity) * (data.price ?? asset.price)
            updated.lastUpdated = new Date().toISOString()
          }
          return updated
        }
        return asset
      }),
    )
  }

  const deleteAsset = (id: number) => {
    setAssetsState((prev: Asset[]) => prev.filter((asset: Asset) => asset.id !== id))
  }

  // --- Funções de Orçamento ---
  const setCategories = (newCategories: Category[]) => setCategoriesState(newCategories)

  const addCategory = (categoryData: Omit<Category, "id" | "spent" | "subcategories" | "expanded">) => {
    const newCategory: Category = {
      ...categoryData,
      id: Math.max(...categories.map((c: Category) => c.id), 0) + 1,
      spent: 0,
      subcategories: [],
      expanded: false,
    }
    setCategoriesState((prev: Category[]) => [...prev, newCategory])
  }

  const updateCategory = (id: number, data: Partial<Category>) => {
    setCategoriesState((prev: Category[]) => prev.map((cat: Category) => (cat.id === id ? { ...cat, ...data } : cat)))
  }

  const deleteCategory = (id: number) => {
    setCategoriesState((prev: Category[]) => prev.filter((cat: Category) => cat.id !== id))
  }

  const addSubcategory = (categoryId: number, subcategoryData: Omit<Subcategory, "id">) => {
    setCategoriesState((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id === categoryId) {
          const newSub: Subcategory = {
            ...subcategoryData,
            id: Math.max(...(cat.subcategories?.map((s: Subcategory) => s.id) || [0]), 0) + 1,
          }
          return {
            ...cat,
            subcategories: [...(cat.subcategories || []), newSub],
            spent: cat.spent + subcategoryData.spent,
          }
        }
        return cat
      }),
    )
  }

  const updateSubcategory = (categoryId: number, subcategoryId: number, data: Partial<Subcategory>) => {
    setCategoriesState((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id === categoryId) {
          const oldSub = cat.subcategories?.find((s: Subcategory) => s.id === subcategoryId)
          const oldSpent = oldSub?.spent || 0
          const newSpent = data.spent ?? oldSpent
          return {
            ...cat,
            subcategories: cat.subcategories?.map((sub: Subcategory) => (sub.id === subcategoryId ? { ...sub, ...data } : sub)),
            spent: cat.spent - oldSpent + newSpent,
          }
        }
        return cat
      }),
    )
  }

  const deleteSubcategory = (categoryId: number, subcategoryId: number) => {
    setCategoriesState((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id === categoryId) {
          const deletedSpent = cat.subcategories?.find((s: Subcategory) => s.id === subcategoryId)?.spent || 0
          return {
            ...cat,
            subcategories: cat.subcategories?.filter((sub: Subcategory) => sub.id !== subcategoryId),
            spent: cat.spent - deletedSpent,
          }
        }
        return cat
      }),
    )
  }

  const toggleCategory = (id: number) => {
    setCategoriesState((prev: Category[]) => prev.map((cat: Category) => (cat.id === id ? { ...cat, expanded: !cat.expanded } : cat)))
  }

  // --- Funções de Metas ---
  const setGoals = (newGoals: Goal[]) => setGoalsState(newGoals)

  const addGoal = (goalData: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...goalData,
      id: Math.max(...goals.map((g: Goal) => g.id), 0) + 1,
    }
    setGoalsState((prev: Goal[]) => [...prev, newGoal])
  }

  const updateGoal = (id: number, data: Partial<Goal>) => {
    setGoalsState((prev: Goal[]) => prev.map((goal: Goal) => (goal.id === id ? { ...goal, ...data } : goal)))
  }

  const deleteGoal = (id: number) => {
    setGoalsState((prev: Goal[]) => prev.filter((goal: Goal) => goal.id !== id))
  }

  const addContributionToGoal = (goalId: number, amount: number) => {
    setGoalsState((prev: Goal[]) =>
      prev.map((goal: Goal) => (goal.id === goalId ? { ...goal, current: goal.current + amount } : goal)),
    )
    setCategoriesState((prev: Category[]) =>
      prev.map((cat: Category) => (cat.name === "Investimentos" ? { ...cat, spent: cat.spent + amount } : cat)),
    )
  }

  // --- Funções de Transações ---
  const setTransactions = (newTransactions: ScheduledTransaction[]) => setTransactionsState(newTransactions)

  const addTransaction = (transactionData: Omit<ScheduledTransaction, "id">) => {
    const newTransaction: ScheduledTransaction = {
      ...transactionData,
      id: Math.max(...transactions.map((t: ScheduledTransaction) => t.id), 0) + 1,
    }
    setTransactionsState((prev: ScheduledTransaction[]) => [...prev, newTransaction])
  }

  const updateTransaction = (id: number, data: Partial<ScheduledTransaction>) => {
    setTransactionsState((prev: ScheduledTransaction[]) => prev.map((t: ScheduledTransaction) => (t.id === id ? { ...t, ...data } : t)))
  }

  const deleteTransaction = (id: number) => {
    setTransactionsState((prev: ScheduledTransaction[]) => prev.filter((t: ScheduledTransaction) => t.id !== id))
  }

  const markAsPaid = (id: number) => {
    const transaction = transactions.find((t: ScheduledTransaction) => t.id === id)
    if (!transaction) return

    setTransactionsState((prev: ScheduledTransaction[]) => prev.map((t: ScheduledTransaction) => (t.id === id ? { ...t, status: "pago" } : t)))

    if (transaction.type === "pagamento" && transaction.categoryId) {
      setCategoriesState((prev: Category[]) =>
        prev.map((cat: Category) =>
          cat.id === transaction.categoryId ? { ...cat, spent: cat.spent + transaction.amount } : cat,
        ),
      )
    }

    if (transaction.recurrence !== "unico") {
      const nextDate = new Date(transaction.dueDate)
      if (transaction.recurrence === "semanal") nextDate.setDate(nextDate.getDate() + 7)
      else if (transaction.recurrence === "mensal") nextDate.setMonth(nextDate.getMonth() + 1)
      else if (transaction.recurrence === "anual") nextDate.setFullYear(nextDate.getFullYear() + 1)

      const newTransaction: ScheduledTransaction = {
        ...transaction,
        id: Math.max(...transactions.map((t: ScheduledTransaction) => t.id), 0) + 1,
        dueDate: nextDate.toISOString().split("T")[0],
        status: "pendente",
      }
      setTransactionsState((prev: ScheduledTransaction[]) => [...prev, newTransaction])
    }
  }

  // --- Funções de Cartão ---
  const setCreditCards = (cards: CreditCard[]) => setCreditCardsState(cards)

  const addCreditCard = (cardData: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      ...cardData,
      id: Math.max(...creditCards.map((c: CreditCard) => c.id), 0) + 1,
    }
    setCreditCardsState((prev: CreditCard[]) => [...prev, newCard])
  }

  const updateCreditCard = (id: number, data: Partial<CreditCard>) => {
    setCreditCardsState((prev: CreditCard[]) => prev.map((card: CreditCard) => (card.id === id ? { ...card, ...data } : card)))
  }

  const deleteCreditCard = (id: number) => {
    setCreditCardsState((prev: CreditCard[]) => prev.filter((card: CreditCard) => card.id !== id))
    setCardExpensesState((prev: CardExpense[]) => prev.filter((expense: CardExpense) => expense.cardId !== id))
  }

  const setCardExpenses = (expenses: CardExpense[]) => setCardExpensesState(expenses)

  const addCardExpense = (expenseData: Omit<CardExpense, "id">) => {
    const newExpense: CardExpense = {
      ...expenseData,
      id: Math.max(...cardExpenses.map((e: CardExpense) => e.id), 0) + 1,
      paidInstallments: 0,
    }
    setCardExpensesState((prev: CardExpense[]) => [...prev, newExpense])
  }

  const updateCardExpense = (id: number, data: Partial<CardExpense>) => {
    setCardExpensesState((prev: CardExpense[]) => prev.map((expense: CardExpense) => (expense.id === id ? { ...expense, ...data } : expense)))
  }

  const deleteCardExpense = (id: number) => {
    setCardExpensesState((prev: CardExpense[]) => prev.filter((expense: CardExpense) => expense.id !== id))
  }

  const calculateInvoices = (cardId?: number) => calculateInvoicesUtil(cardExpenses, creditCards, cardId)

  const getTotalCardDebt = () => {
    return cardExpenses.reduce((sum: number, expense: CardExpense) => {
      const remainingInstallments = expense.installments - (expense.paidInstallments || 0)
      const installmentValue = expense.totalAmount / expense.installments
      return sum + remainingInstallments * installmentValue
    }, 0)
  }

  const getCardAvailableLimit = (cardId: number) => {
    const card = creditCards.find((c: CreditCard) => c.id === cardId)
    if (!card) return 0
    const invoices = calculateInvoices(cardId)
    const nextInvoice = invoices[0]?.total || 0
    return card.limit - nextInvoice
  }

  // --- Funções de Bancos ---
  const setBanks = (newBanks: Bank[]) => setBanksState(newBanks)

  const addBank = (bankData: Omit<Bank, "id">) => {
    const newBank: Bank = {
      ...bankData,
      id: Math.max(...banks.map((b: Bank) => b.id), 0) + 1,
    }
    if (bankData.isMain) {
      setBanksState((prev: Bank[]) => prev.map((b: Bank) => ({ ...b, isMain: false })))
    }
    setBanksState((prev: Bank[]) => [...prev, newBank])
  }

  const updateBank = (id: number, data: Partial<Bank>) => {
    if (data.isMain) {
      setBanksState((prev: Bank[]) => prev.map((b: Bank) => ({ ...b, isMain: b.id === id })))
    }
    setBanksState((prev: Bank[]) => prev.map((bank: Bank) => (bank.id === id ? { ...bank, ...data } : bank)))
  }

  const deleteBank = (id: number) => {
    setAssetsState((prev: Asset[]) => prev.map((a: Asset) => (a.bankId === id ? { ...a, bankId: undefined } : a)))
    setGoalsState((prev: Goal[]) => prev.map((g: Goal) => (g.bankId === id ? { ...g, bankId: undefined } : g)))
    setTransactionsState((prev: ScheduledTransaction[]) => prev.map((t: ScheduledTransaction) => (t.bankId === id ? { ...t, bankId: undefined } : t)))
    setCreditCardsState((prev: CreditCard[]) => prev.map((c: CreditCard) => (c.bankId === id ? { ...c, bankId: undefined } : c)))
    setBanksState((prev: Bank[]) => prev.filter((bank: Bank) => bank.id !== id))
  }

  const getBankById = (id: number) => banks.find((b: Bank) => b.id === id)

  const getTotalBankBalance = () => banks.reduce((sum: number, bank: Bank) => sum + bank.balance, 0)

  const getLinkedItems = (bankId: number) => ({
    assets: assets.filter((a: Asset) => a.bankId === bankId),
    goals: goals.filter((g: Goal) => g.bankId === bankId),
    transactions: transactions.filter((t: ScheduledTransaction) => t.bankId === bankId),
    creditCards: creditCards.filter((c: CreditCard) => c.bankId === bankId),
  })

  // --- Configurações ---
  const updateSettings = (data: Partial<Settings>) => {
    setSettingsState((prev: Settings) => ({ ...prev, ...data }))
    if (data.themeId) setTheme(data.themeId)
  }

  // --- Backup e Restauração ---
  const exportData = (format: "json" | "csv" = "json") => {
    const dataToExport = {
      assets, categories, goals, settings, transactions,
      creditCards, cardExpenses, banks, patrimonialHistory,
      exportedAt: new Date().toISOString(),
      version: "1.2.0-clean",
    }

    if (format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `investment-dashboard-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      let csv = "Tipo,Detalhes\n"
      assets.forEach((a: Asset) => csv += `Ativo,${a.name},${a.currentValue}\n`)
      banks.forEach((b: Bank) => csv += `Banco,${b.name},${b.balance}\n`)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `investment-dashboard-simple-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const importData = (dataString: string): boolean => {
    try {
      const parsed = JSON.parse(dataString)
      if (parsed.assets) setAssetsState(parsed.assets)
      if (parsed.categories) setCategoriesState(parsed.categories)
      if (parsed.goals) setGoalsState(parsed.goals)
      if (parsed.settings) {
        setSettingsState(parsed.settings)
        // Se houver tema salvo, aplica. Senão, 'paper'
        setTheme(parsed.settings.themeId || "paper")
      }
      if (parsed.transactions) setTransactionsState(parsed.transactions)
      if (parsed.creditCards) setCreditCardsState(parsed.creditCards)
      if (parsed.cardExpenses) setCardExpensesState(parsed.cardExpenses)
      if (parsed.banks) setBanksState(parsed.banks)
      if (parsed.patrimonialHistory) setPatrimonialHistory(parsed.patrimonialHistory)
      return true
    } catch {
      return false
    }
  }

  const loadExampleData = () => {
    importData(JSON.stringify(require("@/lib/constants").exampleData))
  }

  const clearAllData = () => {
    if (typeof window !== "undefined" && confirm("Tem certeza que deseja apagar todos os dados?")) {
      window.localStorage.removeItem(STORAGE_KEY)
      setAssetsState([])
      setCategoriesState([])
      setGoalsState([])
      setSettingsState(defaultSettings)
      setTransactionsState([])
      setCreditCardsState([])
      setCardExpensesState([])
      setBanksState([])
      setPatrimonialHistory([])
      setSettingsState(defaultSettings)
      setTheme("paper")
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Carregando seus investimentos...</div>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        assets, setAssets, addAsset, updateAsset, deleteAsset,
        categories, setCategories, addCategory, updateCategory, deleteCategory,
        addSubcategory, updateSubcategory, deleteSubcategory, toggleCategory,
        goals, setGoals, addGoal, updateGoal, deleteGoal, addContributionToGoal,
        transactions, setTransactions, addTransaction, updateTransaction, deleteTransaction, markAsPaid,
        creditCards, setCreditCards, addCreditCard, updateCreditCard, deleteCreditCard,
        cardExpenses, setCardExpenses, addCardExpense, updateCardExpense, deleteCardExpense,
        banks, setBanks, addBank, updateBank, deleteBank, getBankById, getTotalBankBalance, getLinkedItems,
        patrimonialHistory, savePatrimonialSnapshot,
        calculateInvoices, getTotalCardDebt, getCardAvailableLimit,
        settings, updateSettings, currentTheme, setTheme,
        totalNetWorth, totalBudgeted, totalSpent, availableForInvestment,
        monthlyScheduledIncome, monthlyScheduledExpenses, upcomingTransactions,
        exportData, importData, clearAllData, loadExampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook customizado para acessar o contexto global da aplicação.
 */
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp deve ser utilizado dentro de um AppProvider")
  }
  return context
}
