import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  DEFAULT_FINANCE_DATA,
  classifyPriority,
  simulatePayoff,
  calculateLeakImpact,
  analyzeCardPurchases,
  parseNaturalLanguagePurchase,
} from '../utils/financeCalculations'

const FinanceContext = createContext(null)

const STORAGE_KEY = 'consultor_financas_app_data_v1'

export const FinanceProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!parsed.cardPurchases) {
          parsed.cardPurchases = DEFAULT_FINANCE_DATA.cardPurchases
        }
        if (!parsed.customRules) {
          parsed.customRules = DEFAULT_FINANCE_DATA.customRules || {}
        }
        if (parsed.declaredInvoiceTotal === undefined) {
          parsed.declaredInvoiceTotal = DEFAULT_FINANCE_DATA.declaredInvoiceTotal || 0
        }
        return parsed
      }
    } catch (e) {
      console.error('Falha ao carregar dados do localStorage:', e)
    }
    return DEFAULT_FINANCE_DATA
  })

  // Salva no localStorage sempre que os dados mudam
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e)
    }
  }, [data])

  // Helpers de Atualização de Renda
  const setMonthlyIncome = (val) => {
    setData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        monthlyIncome: Number(val) || 0,
      },
    }))
  }

  // Custos Fixos
  const addFixedExpense = (expense) => {
    const newExpense = {
      id: Date.now().toString(),
      name: expense.name || 'Nova Despesa Fixa',
      amount: Number(expense.amount) || 0,
      isEssential: expense.isEssential !== undefined ? expense.isEssential : true,
    }
    setData((prev) => ({
      ...prev,
      fixedExpenses: [...prev.fixedExpenses, newExpense],
    }))
  }

  const removeFixedExpense = (id) => {
    setData((prev) => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.filter((item) => item.id !== id),
    }))
  }

  const updateFixedExpense = (id, updated) => {
    setData((prev) => ({
      ...prev,
      fixedExpenses: prev.fixedExpenses.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }))
  }

  // Dívidas
  const addDebt = (debt) => {
    const newDebt = {
      id: Date.now().toString(),
      name: debt.name || 'Nova Dívida',
      category: debt.category || 'cartao',
      balance: Number(debt.balance) || 0,
      minPayment: Number(debt.minPayment) || 0,
      interestRate: Number(debt.interestRate) || 0,
      isEssential: Boolean(debt.isEssential),
    }
    setData((prev) => ({
      ...prev,
      debts: [...prev.debts, newDebt],
    }))
  }

  const removeDebt = (id) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.filter((item) => item.id !== id),
    }))
  }

  const updateDebt = (id, updated) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }))
  }

  // Ralos Financeiros
  const addLeak = (leak) => {
    const newLeak = {
      id: Date.now().toString(),
      name: leak.name || 'Gasto Impulsivo',
      category: leak.category || 'Outros',
      amount: Number(leak.amount) || 0,
      date: leak.date || new Date().toISOString(),
    }
    setData((prev) => ({
      ...prev,
      leaks: [newLeak, ...prev.leaks],
    }))
  }

  const removeLeak = (id) => {
    setData((prev) => ({
      ...prev,
      leaks: prev.leaks.filter((item) => item.id !== id),
    }))
  }

  const clearLeaks = () => {
    setData((prev) => ({
      ...prev,
      leaks: [],
    }))
  }

  // Compras de Cartão de Crédito
  const addCardPurchase = (purchase) => {
    const newPurchase = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      title: purchase.title || 'Compra Cartão',
      amount: Number(purchase.amount) || 0,
      category: purchase.category || 'Outros Gastos',
      isEssential: Boolean(purchase.isEssential),
      owner: purchase.owner || 'me', // 'me' | 'sogra'
      date: purchase.date || new Date().toISOString(),
    }
    setData((prev) => ({
      ...prev,
      cardPurchases: [newPurchase, ...(prev.cardPurchases || [])],
    }))
    return newPurchase
  }

  const addBulkCardPurchases = (purchasesArray) => {
    const prepared = purchasesArray.map((p) => ({
      ...p,
      owner: p.owner || 'me',
    }))
    setData((prev) => ({
      ...prev,
      cardPurchases: [...prepared, ...(prev.cardPurchases || [])],
    }))
  }

  const updateCardPurchase = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      cardPurchases: (prev.cardPurchases || []).map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    }))
  }

  const togglePurchaseOwner = (id) => {
    setData((prev) => ({
      ...prev,
      cardPurchases: (prev.cardPurchases || []).map((item) => {
        if (item.id === id) {
          const nextOwner = item.owner === 'sogra' ? 'me' : 'sogra'
          return { ...item, owner: nextOwner }
        }
        return item
      }),
    }))
  }

  const removeCardPurchase = (id) => {
    setData((prev) => ({
      ...prev,
      cardPurchases: (prev.cardPurchases || []).filter((item) => item.id !== id),
    }))
  }

  const clearCardPurchases = (ownerFilter = null) => {
    if (!ownerFilter) {
      setData((prev) => ({ ...prev, cardPurchases: [] }))
    } else {
      setData((prev) => ({
        ...prev,
        cardPurchases: (prev.cardPurchases || []).filter((item) => item.owner !== ownerFilter),
      }))
    }
  }

  const setDeclaredInvoiceTotal = (val) => {
    setData((prev) => ({
      ...prev,
      declaredInvoiceTotal: Number(val) || 0,
    }))
  }

  // Adição Inteligente via Linguagem Natural (Chat / Assistente)
  const addNaturalLanguagePurchase = (inputText) => {
    const parsed = parseNaturalLanguagePurchase(inputText, data.customRules || {})
    if (parsed) {
      addCardPurchase(parsed)
      return parsed
    }
    return null
  }

  // Regras Personalizadas de Aprendizado (Ensinar o App)
  const setCustomRule = (term, category) => {
    if (!term) return
    const cleanTerm = term.toLowerCase().trim()
    const isEssential =
      category.includes('Mercado') ||
      category.includes('Saúde') ||
      category.includes('Transporte') ||
      category.includes('Combustível') ||
      category.includes('Educação')

    setData((prev) => {
      const updatedRules = {
        ...(prev.customRules || {}),
        [cleanTerm]: category,
      }

      const updatedPurchases = (prev.cardPurchases || []).map((p) => {
        if (p.title.toLowerCase().includes(cleanTerm)) {
          return {
            ...p,
            category,
            isEssential,
          }
        }
        return p
      })

      return {
        ...prev,
        customRules: updatedRules,
        cardPurchases: updatedPurchases,
      }
    })
  }

  const removeCustomRule = (term) => {
    const cleanTerm = term.toLowerCase().trim()
    setData((prev) => {
      const copy = { ...(prev.customRules || {}) }
      delete copy[cleanTerm]
      return {
        ...prev,
        customRules: copy,
      }
    })
  }

  // Configurações e Estratégia
  const setStrategy = (strategy) => {
    setData((prev) => ({ ...prev, strategy }))
  }

  const setExtraMonthlyPayment = (val) => {
    setData((prev) => ({ ...prev, extraMonthlyPayment: Number(val) || 0 }))
  }

  // Ações de Gestão de Dados
  const loadDemoData = () => {
    setData(DEFAULT_FINANCE_DATA)
  }

  const clearAllData = () => {
    const blank = {
      profile: { monthlyIncome: 0, incomeSources: [] },
      fixedExpenses: [],
      debts: [],
      leaks: [],
      cardPurchases: [],
      declaredInvoiceTotal: 0,
      customRules: {},
      strategy: 'avalanche',
      extraMonthlyPayment: 0,
    }
    setData(blank)
  }

  const importData = (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      if (parsed.debts && parsed.fixedExpenses) {
        if (!parsed.cardPurchases) parsed.cardPurchases = []
        if (!parsed.customRules) parsed.customRules = {}
        if (parsed.declaredInvoiceTotal === undefined) parsed.declaredInvoiceTotal = 0
        setData(parsed)
        return true
      }
    } catch (e) {
      console.error('Dados inválidos para importação', e)
    }
    return false
  }

  // Cálculos Consolidados
  const totalIncome = Number(data.profile?.monthlyIncome) || 0
  const totalFixedExpenses = (data.fixedExpenses || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalDebtBalance = (data.debts || []).reduce((sum, item) => sum + (Number(item.balance) || 0), 0)
  const totalDebtMinPayments = (data.debts || []).reduce((sum, item) => sum + (Number(item.minPayment) || 0), 0)

  // Análise da Fatura de Cartão de Crédito com Isolamento da Sogra
  const cardAnalysis = analyzeCardPurchases(data.cardPurchases || [], data.declaredInvoiceTotal || 0)

  // Saldo Líquido Livre para Aporte Estratégico
  const cashflowSurplus = totalIncome - totalFixedExpenses - totalDebtMinPayments
  const totalAttackFund = Math.max(0, cashflowSurplus) + (Number(data.extraMonthlyPayment) || 0)

  // Classificação das Dívidas com prioridade calculada
  const prioritizedDebts = (data.debts || []).map((debt) => ({
    ...debt,
    priority: classifyPriority(debt),
  }))

  const priorityCounts = {
    p1: prioritizedDebts.filter((d) => d.priority.level === 1).length,
    p2: prioritizedDebts.filter((d) => d.priority.level === 2).length,
    p3: prioritizedDebts.filter((d) => d.priority.level === 3).length,
  }

  // Simulação de Quitação
  const payoffSimulation = simulatePayoff({
    debts: data.debts || [],
    monthlyIncome: totalIncome,
    fixedExpenses: totalFixedExpenses,
    extraMonthlyPayment: data.extraMonthlyPayment || 0,
    strategy: data.strategy || 'avalanche',
  })

  // Impacto dos Ralos
  const leakStats = calculateLeakImpact(data.leaks || [])

  // Nível de Alerta Geral
  let financialHealth = 'alerta'
  let healthTitle = 'Atenção Necessária'
  let healthMessage = 'Seus custos e parcelas consomem a maior parte da sua renda.'
  let healthBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30'

  if (cashflowSurplus < 0) {
    financialHealth = 'critico'
    healthTitle = 'Déficit Mensal Crítico'
    healthMessage = 'Você está gastando mais do que ganha todo mês! Risco de endividamento bola de neve.'
    healthBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  } else if (totalDebtBalance === 0) {
    financialHealth = 'livre'
    healthTitle = '100% Livre de Dívidas!'
    healthMessage = 'Parabéns! Foco total na reserva de emergência e investimentos.'
    healthBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  } else if (cashflowSurplus > 500) {
    financialHealth = 'positivo'
    healthTitle = 'Capacidade de Ataque Forte'
    healthMessage = 'Você tem fôlego mensal para quitar suas dívidas muito antes do prazo com o método certo.'
    healthBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
  }

  return (
    <FinanceContext.Provider
      value={{
        data,
        setMonthlyIncome,
        addFixedExpense,
        removeFixedExpense,
        updateFixedExpense,
        addDebt,
        removeDebt,
        updateDebt,
        addLeak,
        removeLeak,
        clearLeaks,
        // Cartão Compartilhado & Sogra
        addCardPurchase,
        addBulkCardPurchases,
        updateCardPurchase,
        togglePurchaseOwner,
        removeCardPurchase,
        clearCardPurchases,
        setDeclaredInvoiceTotal,
        addNaturalLanguagePurchase,
        setCustomRule,
        removeCustomRule,
        cardAnalysis,
        // Estratégia
        setStrategy,
        setExtraMonthlyPayment,
        loadDemoData,
        clearAllData,
        importData,
        // Computed
        totalIncome,
        totalFixedExpenses,
        totalDebtBalance,
        totalDebtMinPayments,
        cashflowSurplus,
        totalAttackFund,
        prioritizedDebts,
        priorityCounts,
        payoffSimulation,
        leakStats,
        financialHealth,
        healthTitle,
        healthMessage,
        healthBadge,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider')
  }
  return context
}
