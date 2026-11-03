import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatBRL } from '../utils/financeCalculations'
import {
  Flame,
  Coffee,
  ShoppingBag,
  Car,
  Tv,
  Plus,
  Trash2,
  Calendar,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

export const RalosTab = () => {
  const { data, addLeak, removeLeak, clearLeaks, leakStats, totalDebtBalance } = useFinance()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Delivery')

  const quickCategories = [
    { label: 'iFood / Delivery', cat: 'Delivery', icon: Flame },
    { label: 'Café / Lanches', cat: 'Lanches', icon: Coffee },
    { label: 'Uber / Transporte', cat: 'Transporte', icon: Car },
    { label: 'Compra por Impulso', cat: 'Impulso', icon: ShoppingBag },
    { label: 'Assinatura Esquecida', cat: 'Assinatura', icon: Tv },
  ]

  const handleAddLeak = (e) => {
    e.preventDefault()
    if (!amount) return

    addLeak({
      name: name.trim() || category,
      category,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
    })

    setName('')
    setAmount('')
  }

  // Atalho para adicionar rápido com valor pré-definido
  const handleQuickAdd = (catName, defaultAmt) => {
    addLeak({
      name: catName,
      category: catName,
      amount: defaultAmt,
      date: new Date().toISOString(),
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner Explicativo */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Diário de Ralos Financeiros (Tracking 14 Dias)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Pequenos gastos diários parecem inofensivos, mas somados formam uma sangria contínua. Registre qualquer impulso ou supérfluo aqui para ver o impacto real.
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <Zap size={14} /> {leakStats.count} vazamentos registrados
          </div>
        </div>
      </div>

      {/* Choque de Realidade: Painel de Projeções do Impacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total em 14 Dias */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Gasto nos 14 Dias</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {formatBRL(leakStats.totalSpent14Days)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Dinheiro escorrido no período</p>
        </div>

        {/* Média Diária */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Média por Dia</span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {formatBRL(leakStats.dailyAverage)}
            <span className="text-xs font-normal text-slate-400">/dia</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Pequenas quantias repetidas</p>
        </div>

        {/* Projeção Mensal (30 dias) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Projeção Mensal (30d)</span>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            {formatBRL(leakStats.monthlyProjection)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">O que vai pro ralo todo mês</p>
        </div>

        {/* Projeção Anual (365 dias) */}
        <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-medium">Projeção Anual (365d)</span>
            <Flame size={16} className="text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            {formatBRL(leakStats.annualProjection)}
          </div>
          <p className="text-[11px] text-rose-300/80 mt-0.5">Vazamento invisível acumulado</p>
        </div>
      </div>

      {/* Cartão de Insight Comparativo */}
      {leakStats.annualProjection > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle size={22} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-300 mb-1">
              Choque de Realidade do Consultor:
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ao estancar apenas <span className="text-white font-bold">50% desses ralos</span>, você redireciona cerca de{' '}
              <span className="text-emerald-400 font-bold">{formatBRL(leakStats.monthlyProjection * 0.5)} por mês</span> ({formatBRL(leakStats.annualProjection * 0.5)} ao ano) diretamente para a sua dívida prioritária ou para a sua poupança!
            </p>
          </div>
        </div>
      )}

      {/* Botões de Registro Rápido (Perfeito para Celular) */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>Registro Rápido (1 Toque)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {quickCategories.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.cat}
                onClick={() => setCategory(item.cat)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  category === item.cat
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium text-center">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Formulário de Registro do Gasto */}
        <form onSubmit={handleAddLeak} className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={`Descrição rápida (Ex: ${category})`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <div className="relative w-full sm:w-44">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              required
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-950"
          >
            <Plus size={16} /> Registrar Ralo
          </button>
        </form>
      </div>

      {/* Histórico dos 14 Dias */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span>Histórico de Micro-vazamentos</span>
          </h3>
          {data.leaks.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Deseja limpar todos os registros do diário de ralos?')) {
                  clearLeaks()
                }
              }}
              className="text-xs text-slate-500 hover:text-rose-400 transition"
            >
              Limpar Diário
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {data.leaks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhum vazamento registrado ainda. Registre seus cafezinhos, entregas ou corridas acima!
            </div>
          ) : (
            data.leaks.map((leak) => {
              const leakDate = leak.date ? new Date(leak.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }) : 'Hoje'

              return (
                <div
                  key={leak.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Flame size={14} />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-slate-200 block">
                        {leak.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {leak.category} • {leakDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-bold text-rose-400">
                      -{formatBRL(leak.amount)}
                    </span>
                    <button
                      onClick={() => removeLeak(leak.id)}
                      className="p-1 text-slate-600 hover:text-rose-400 transition"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
