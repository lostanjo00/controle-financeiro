import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatBRL } from '../utils/financeCalculations'
import {
  Wallet,
  Home,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Sparkles,
  Info,
  Pencil,
  RotateCcw,
  ArrowRight,
  HeartHandshake,
} from 'lucide-react'

export const RaioXTab = ({ setActiveTab }) => {
  const {
    data,
    setMonthlyIncome,
    addFixedExpense,
    removeFixedExpense,
    updateFixedExpense,
    clearAllData,
    totalIncome,
    totalFixedExpenses,
    totalDebtMinPayments,
    cashflowSurplus,
    totalDebtBalance,
    cardAnalysis,
  } = useFinance()

  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [isEssential, setIsEssential] = useState(true)

  // Estado de edição de despesa fixa
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const handleAddExpense = (e) => {
    e.preventDefault()
    if (!newExpenseName.trim() || !newExpenseAmount) return
    addFixedExpense({
      name: newExpenseName.trim(),
      amount: parseFloat(newExpenseAmount),
      isEssential,
    })
    setNewExpenseName('')
    setNewExpenseAmount('')
  }

  const startEditExpense = (expense) => {
    setEditingExpenseId(expense.id)
    setEditName(expense.name)
    setEditAmount(expense.amount.toString())
  }

  const saveEditExpense = (e) => {
    e.preventDefault()
    if (!editName.trim() || !editAmount) return
    updateFixedExpense(editingExpenseId, {
      name: editName.trim(),
      amount: parseFloat(editAmount),
    })
    setEditingExpenseId(null)
  }

  // Percentuais de comprometimento
  const fixedPercent = totalIncome > 0 ? (totalFixedExpenses / totalIncome) * 100 : 0
  const debtsMinPercent = totalIncome > 0 ? (totalDebtMinPayments / totalIncome) * 100 : 0
  const surplusPercent = totalIncome > 0 ? Math.max(0, (cashflowSurplus / totalIncome) * 100) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner de Boas-Vindas e Metodologia */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-lg sm:text-xl font-bold text-white">Raio-X do Orçamento Doméstico</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Insira sua renda real e despesas essenciais. Você pode alterar qualquer número com 1 clique ou começar do zero.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Deseja limpar todos os valores de exemplo e começar a preencher seus dados reais do zero?')) {
                clearAllData()
              }
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
          >
            <RotateCcw size={14} /> Começar do Zero
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Renda Líquida */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Renda Líquida</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-white mb-1">
            {formatBRL(totalIncome)}
          </div>
          <p className="text-[11px] text-slate-400">Edite no campo abaixo</p>
        </div>

        {/* Custos Fixos Essenciais */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Custos Fixos</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Home size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-blue-400 mb-1">
            {formatBRL(totalFixedExpenses)}
          </div>
          <p className="text-[11px] text-slate-400">
            {fixedPercent.toFixed(0)}% da renda (aluguel, mercado)
          </p>
        </div>

        {/* Parcelas Mínimas das Dívidas */}
        <div
          onClick={() => setActiveTab && setActiveTab('dividas')}
          className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-2xl relative overflow-hidden group cursor-pointer transition"
          title="Clique para ver ou alterar suas dívidas"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-amber-300">Parcelas Dívidas</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-amber-400 mb-1">
            {formatBRL(totalDebtMinPayments)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400/80 group-hover:text-amber-300 font-semibold">
            <span>Alterar Dívidas</span>
            <ArrowRight size={12} />
          </div>
        </div>

        {/* Saldo Líquido Livre (Capacidade de Ataque) */}
        <div
          className={`p-4 rounded-2xl border transition relative overflow-hidden ${
            cashflowSurplus >= 0
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Saldo Livre (Ataque)</span>
            <div
              className={`p-2 rounded-xl ${
                cashflowSurplus >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {cashflowSurplus >= 0 ? <Sparkles size={16} /> : <TrendingDown size={16} />}
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold mb-1">
            {formatBRL(cashflowSurplus)}
          </div>
          <p className="text-[11px] text-slate-400">
            {cashflowSurplus >= 0
              ? 'Sobra real após custos e parcelas'
              : 'Déficit! Faltando dinheiro no mês'}
          </p>
        </div>
      </div>

      {/* Destaque do Cartão Compartilhado com a Sogra */}
      {cardAnalysis.sograTotal > 0 && (
        <div
          onClick={() => setActiveTab && setActiveTab('cartao')}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-purple-400 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
              <HeartHandshake size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Cartão Compartilhado Ativo: Gastos da Sogra Isolados
              </span>
              <p className="text-[11px] text-slate-300">
                <strong className="text-purple-300">{formatBRL(cardAnalysis.sograTotal)}</strong> em compras dela foram deduzidos automaticamente da fatura total ({formatBRL(cardAnalysis.invoiceTotal)}). Sua fatura líquida real é de <strong className="text-emerald-400">{formatBRL(cardAnalysis.myReconciledNetTotal)}</strong>.
              </p>
            </div>
          </div>
          <span className="text-xs text-purple-400 font-semibold flex items-center gap-1 shrink-0 self-end sm:self-auto">
            <span>Ver Fatura da Sogra</span>
            <ArrowRight size={13} />
          </span>
        </div>
      )}

      {/* Barra Visual de Alocação de Renda */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Composição da sua Renda Líquida
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {fixedPercent.toFixed(0)}% Fixos + {debtsMinPercent.toFixed(0)}% Dívidas
          </span>
        </div>
        <div className="h-4 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            style={{ width: `${Math.min(100, fixedPercent)}%` }}
            className="bg-blue-500 rounded-l-full transition-all duration-500"
            title={`Custos Fixos: ${fixedPercent.toFixed(1)}%`}
          ></div>
          <div
            style={{ width: `${Math.min(100 - fixedPercent, debtsMinPercent)}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Dívidas: ${debtsMinPercent.toFixed(1)}%`}
          ></div>
          {surplusPercent > 0 && (
            <div
              style={{ width: `${Math.min(100, surplusPercent)}%` }}
              className="bg-emerald-500 rounded-r-full transition-all duration-500"
              title={`Saldo Livre: ${surplusPercent.toFixed(1)}%`}
            ></div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Custos Fixos Essenciais ({fixedPercent.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Parcelas Dívidas ({debtsMinPercent.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Saldo para Quitação ({surplusPercent.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Grade Principal: Renda & Custos Fixos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Ajuste de Renda */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Wallet size={18} />
              </div>
              <h3 className="font-bold text-white text-base">Renda Líquida Mensal</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Altere o valor abaixo para quanto realmente cai na sua conta todo mês (salário, bicos, renda extra).
            </p>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Valor Mensal (R$)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={data.profile.monthlyIncome || ''}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-base font-bold text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1">💡 Dica do Consultor:</span>
            Ao alterar esse número, todo o diagnóstico e o tempo de quitação das dívidas são recalculados instantaneamente!
          </div>
        </div>

        {/* Coluna 2 e 3: Custos Fixos Essenciais */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Home size={18} />
                </div>
                <h3 className="font-bold text-white text-base">Custos Fixos Essenciais</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Altere ou exclua os exemplos para colocar as suas contas reais de casa.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start sm:self-auto">
              Total: {formatBRL(totalFixedExpenses)}
            </span>
          </div>

          {/* Lista de Custos Fixos */}
          <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
            {data.fixedExpenses.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Nenhum custo fixo cadastrado. Adicione seus gastos abaixo!
              </div>
            ) : (
              data.fixedExpenses.map((expense) => {
                const isEditing = editingExpenseId === expense.id

                return (
                  <div
                    key={expense.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    {isEditing ? (
                      <form onSubmit={saveEditExpense} className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          required
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full sm:w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                          required
                        />
                        <div className="flex gap-1">
                          <button
                            type="submit"
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg font-semibold"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingExpenseId(null)}
                            className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-slate-200">
                              {expense.name}
                            </span>
                            {expense.isEssential && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Essencial
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {formatBRL(expense.amount)}
                          </span>
                          <button
                            onClick={() => startEditExpense(expense)}
                            className="p-1 text-slate-500 hover:text-cyan-400 rounded transition"
                            title="Editar valor ou nome"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => removeFixedExpense(expense.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Formulário para Adicionar Custo Fixo */}
          <form
            onSubmit={handleAddExpense}
            className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Ex: Aluguel, Mercado básico, Luz"
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <div className="relative w-full sm:w-36">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg py-2 pl-7 pr-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition shrink-0"
            >
              <Plus size={15} /> Adicionar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
