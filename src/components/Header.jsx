import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatBRL } from '../utils/financeCalculations'
import { ShieldAlert, TrendingUp, Settings2, Wallet, ArrowDownRight, Sparkles, FileText } from 'lucide-react'
import { DataManagementModal } from './DataManagementModal'
import { ReportModal } from './ReportModal'

export const Header = () => {
  const {
    cashflowSurplus,
    totalDebtBalance,
    totalIncome,
    financialHealth,
    healthTitle,
    healthBadge,
  } = useFinance()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <>
      <header className="no-print border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Marca */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
                F$
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Finanças & Liberdade
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Consultor IA
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Diagnóstico em tempo real, raio-x de dívidas e linha do tempo de quitação
                </p>
              </div>
            </div>

            {/* Botões rápidos no mobile */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={() => setIsReportOpen(true)}
                className="p-2 text-emerald-400 hover:text-white rounded-lg bg-emerald-950/40 border border-emerald-500/30"
                title="Gerar Relatório em PDF"
              >
                <FileText size={18} />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 border border-slate-700/60"
                title="Configurações e Backup"
              >
                <Settings2 size={18} />
              </button>
            </div>
          </div>

          {/* Mini Indicadores Rápidos no Topo */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Status Geral */}
            <div className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium ${healthBadge}`}>
              {financialHealth === 'critico' ? (
                <ShieldAlert size={14} />
              ) : financialHealth === 'livre' ? (
                <Sparkles size={14} />
              ) : (
                <TrendingUp size={14} />
              )}
              <span>{healthTitle}</span>
            </div>

            {/* Saldo Livre */}
            <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Saldo Livre:</span>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  cashflowSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatBRL(cashflowSurplus)}
              </span>
            </div>

            {/* Total Dívidas */}
            <div className="bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-xl hidden sm:flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Total Dívidas:</span>
              <span className="text-xs sm:text-sm font-bold text-amber-400">
                {formatBRL(totalDebtBalance)}
              </span>
            </div>

            {/* Botão de Relatório PDF no desktop */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold shadow-md shadow-emerald-950 transition"
              title="Gerar Relatório em PDF"
            >
              <FileText size={15} />
              <span>Gerar PDF</span>
            </button>

            {/* Botão de backup/config no desktop */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition"
              title="Configurações e Backup"
            >
              <Settings2 size={15} />
              <span>Backup</span>
            </button>
          </div>
        </div>
      </header>

      <DataManagementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </>
  )
}
