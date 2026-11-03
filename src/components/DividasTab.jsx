import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatBRL } from '../utils/financeCalculations'
import {
  CreditCard,
  AlertTriangle,
  Flame,
  Plus,
  Trash2,
  Percent,
  CheckCircle2,
  ShieldCheck,
  Filter,
  Pencil,
  RotateCcw,
} from 'lucide-react'

export const DividasTab = () => {
  const {
    prioritizedDebts,
    addDebt,
    removeDebt,
    updateDebt,
    clearAllData,
    loadDemoData,
    totalDebtBalance,
    totalDebtMinPayments,
  } = useFinance()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDebtId, setEditingDebtId] = useState(null)
  const [filterPriority, setFilterPriority] = useState('all')

  // Form State
  const [name, setName] = useState('')
  const [category, setCategory] = useState('cartao')
  const [balance, setBalance] = useState('')
  const [minPayment, setMinPayment] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [isEssential, setIsEssential] = useState(false)

  const handleOpenAddModal = () => {
    setEditingDebtId(null)
    setName('')
    setCategory('cartao')
    setBalance('')
    setMinPayment('')
    setInterestRate('14.2')
    setIsEssential(false)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (debt) => {
    setEditingDebtId(debt.id)
    setName(debt.name)
    setCategory(debt.category || 'cartao')
    setBalance(debt.balance.toString())
    setMinPayment(debt.minPayment?.toString() || '0')
    setInterestRate(debt.interestRate?.toString() || '0')
    setIsEssential(Boolean(debt.isEssential))
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !balance) return

    const debtPayload = {
      name: name.trim(),
      category,
      balance: parseFloat(balance),
      minPayment: parseFloat(minPayment) || 0,
      interestRate: parseFloat(interestRate) || 0,
      isEssential,
    }

    if (editingDebtId) {
      updateDebt(editingDebtId, debtPayload)
    } else {
      addDebt(debtPayload)
    }

    setIsModalOpen(false)
    setEditingDebtId(null)
  }

  // Preenchimento de taxas comuns do Brasil para ajudar o usuário
  const handleCategoryPreset = (cat) => {
    setCategory(cat)
    if (cat === 'cartao') {
      setInterestRate('14.2')
      setIsEssential(false)
    } else if (cat === 'cheque') {
      setInterestRate('8.5')
      setIsEssential(false)
    } else if (cat === 'pessoal') {
      setInterestRate('5.0')
      setIsEssential(false)
    } else if (cat === 'consignado') {
      setInterestRate('1.8')
      setIsEssential(false)
    } else if (cat === 'financiamento') {
      setInterestRate('1.6')
      setIsEssential(false)
    } else if (cat === 'essencial') {
      setInterestRate('0')
      setIsEssential(true)
    }
  }

  // Filtros
  const filteredDebts = prioritizedDebts.filter((debt) => {
    if (filterPriority === 'all') return true
    return debt.priority.level.toString() === filterPriority
  })

  // Custo mensal total estimado apenas em juros
  const monthlyInterestCost = prioritizedDebts.reduce((sum, d) => {
    return sum + (Number(d.balance) * (Number(d.interestRate) || 0)) / 100
  }, 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Ações */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h2 className="text-lg sm:text-xl font-bold text-white">Matriz de Priorização de Dívidas</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Altere, adicione ou remova qualquer dívida. O app calcula em tempo real o valor das parcelas, taxas e urgência.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {prioritizedDebts.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Deseja limpar as dívidas de exemplo para cadastrar as suas próprias do zero?')) {
                  clearAllData()
                }
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <RotateCcw size={14} /> Começar do Zero
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition"
          >
            <Plus size={16} /> Nova Dívida
          </button>
        </div>
      </div>

      {/* Cartões de Alerta & Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Devedor Total */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Saldo Devedor Total</span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {formatBRL(totalDebtBalance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Soma de todo o passivo em aberto</p>
        </div>

        {/* Juros Queimados Todo Mês */}
        <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-medium">Juros Queimados/Mês</span>
            <Flame size={16} className="text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            ~{formatBRL(monthlyInterestCost)}
          </div>
          <p className="text-[11px] text-rose-400/80 mt-0.5">Dinheiro que o banco ganha sem amortizar nada</p>
        </div>

        {/* Parcelas Mínimas Obrigatórias */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Parcelas Mensais Mínimas</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {formatBRL(totalDebtMinPayments)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Soma das parcelas que vencem este mês</p>
        </div>
      </div>

      {/* Filtro por Nível de Prioridade */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter size={15} />
          <span className="font-medium">Filtrar por Gravidade:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              filterPriority === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({prioritizedDebts.length})
          </button>
          <button
            onClick={() => setFilterPriority('1')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              filterPriority === '1'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-950 text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            Prioridade 1: Máxima
          </button>
          <button
            onClick={() => setFilterPriority('2')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              filterPriority === '2'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            Prioridade 2: Média
          </button>
          <button
            onClick={() => setFilterPriority('3')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              filterPriority === '3'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            Prioridade 3: Essencial
          </button>
        </div>
      </div>

      {/* Lista de Dívidas Classificadas */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <ShieldCheck size={36} className="mx-auto text-emerald-400 mb-2 opacity-80" />
            <h4 className="text-base font-semibold text-slate-200">Nenhuma dívida cadastrada</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Clique no botão abaixo para adicionar suas dívidas reais.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
            >
              + Adicionar Minha Primeira Dívida
            </button>
          </div>
        ) : (
          filteredDebts.map((debt) => {
            const monthlyInterest = (Number(debt.balance) * (Number(debt.interestRate) || 0)) / 100
            return (
              <div
                key={debt.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition relative overflow-hidden"
              >
                {/* Indicador lateral colorido */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    debt.priority.level === 1
                      ? 'bg-rose-500'
                      : debt.priority.level === 2
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-2">
                  {/* Cabeçalho da Dívida */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-white">{debt.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${debt.priority.badgeClass}`}
                      >
                        {debt.priority.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{debt.priority.description}</p>
                  </div>

                  {/* Botões de Ação: Editar e Excluir */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEditModal(debt)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700/80 flex items-center gap-1 transition"
                      title="Editar esta dívida (parcelas, saldo, taxa)"
                    >
                      <Pencil size={13} />
                      <span>Alterar</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja remover a dívida "${debt.name}"?`)) {
                          removeDebt(debt.id)
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Excluir dívida"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Métricas da Dívida */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80 pl-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Saldo Devedor</span>
                    <span className="text-sm sm:text-base font-bold text-white">
                      {formatBRL(debt.balance)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Taxa de Juros</span>
                    <span className="text-sm sm:text-base font-bold text-amber-400 flex items-center gap-1">
                      <Percent size={13} /> {debt.interestRate}% <span className="text-[10px] text-slate-400">a.m.</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Parcela / Mínimo</span>
                    <span className="text-sm sm:text-base font-bold text-emerald-400">
                      {formatBRL(debt.minPayment)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-rose-400/90 block">Juros em 30 Dias</span>
                    <span className="text-sm sm:text-base font-bold text-rose-400">
                      +{formatBRL(monthlyInterest)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal de Cadastro / Edição de Dívida */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-400" />
              <span>{editingDebtId ? 'Alterar Dívida' : 'Cadastrar Nova Dívida'}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Informe o valor da parcela mensal que você paga e o saldo devedor para atualizar seus cálculos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Presets Rápidos */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tipo de Dívida (Sugestão de Juros Médios)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'cartao', label: 'Cartão de Crédito (~14% a.m.)' },
                    { id: 'cheque', label: 'Cheque Especial (~8.5% a.m.)' },
                    { id: 'pessoal', label: 'Empréstimo Pessoal (~5% a.m.)' },
                    { id: 'consignado', label: 'Consignado (~1.8% a.m.)' },
                    { id: 'financiamento', label: 'Financiamento Veículo/Imóvel' },
                    { id: 'essencial', label: 'Conta Essencial Atrasada' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleCategoryPreset(p.id)}
                      className={`p-2 rounded-xl text-left border text-[11px] transition ${
                        category === p.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nome da Dívida ou Banco
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cartão Nubank, Cheque Itaú, Financiamento Carro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Saldo Devedor & Parcela */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Saldo Devedor Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Quanto falta para quitar tudo hoje
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor da Parcela Mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={minPayment}
                    onChange={(e) => setMinPayment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Quanto você paga por mês desta dívida
                  </span>
                </div>
              </div>

              {/* Taxa de Juros Mensal */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Taxa de Juros Mensal (% a.m.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 14.2"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingDebtId(null)
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950"
                >
                  {editingDebtId ? 'Salvar Alterações' : 'Cadastrar Dívida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
