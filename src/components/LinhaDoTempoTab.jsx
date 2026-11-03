import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatBRL } from '../utils/financeCalculations'
import confetti from 'canvas-confetti'
import {
  CalendarClock,
  Sparkles,
  Trophy,
  ArrowRight,
  Sliders,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  Zap,
  CheckCircle,
} from 'lucide-react'

export const LinhaDoTempoTab = () => {
  const {
    data,
    setStrategy,
    setExtraMonthlyPayment,
    payoffSimulation,
    totalDebtBalance,
    totalFixedExpenses,
    cashflowSurplus,
  } = useFinance()

  const [activeView, setActiveView] = useState('milestones') // 'milestones' | 'monthly'

  const handleConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  // Previsão da Reserva de Emergência
  // Meta recomendada: 6 meses de custos fixos essenciais
  const emergencyFundTarget = totalFixedExpenses * 6
  // Dinheiro livre mensal após quitar todas as dívidas
  const freedMonthlyAfterPayoff = payoffSimulation.freedCashflow || 0
  // Meses necessários para juntar a reserva após as dívidas
  const monthsForEmergency =
    freedMonthlyAfterPayoff > 0 ? Math.ceil(emergencyFundTarget / freedMonthlyAfterPayoff) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Linha do Tempo de Alívio Financeiro
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Descubra em qual mês exato sua primeira dívida será zerada e o momento da sua liberdade total para começar a poupar.
          </p>
        </div>

        {payoffSimulation.success && (
          <button
            onClick={handleConfetti}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition self-start md:self-auto"
          >
            <Sparkles size={15} /> Simular Vitória! 🎉
          </button>
        )}
      </div>

      {/* Controles de Estratégia e Aporte Extra */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Escolha da Estratégia */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl lg:col-span-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Estratégia de Ataque
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setStrategy('avalanche')}
              className={`p-4 rounded-xl border text-left transition ${
                data.strategy === 'avalanche'
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">Método Avalanche</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                  Mais Econômico
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioriza os maiores juros primeiro (cartão, cheque). Reduz drasticamente o dinheiro queimado com o banco.
              </p>
            </button>

            <button
              onClick={() => setStrategy('snowball')}
              className={`p-4 rounded-xl border text-left transition ${
                data.strategy === 'snowball'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm">Método Bola de Neve</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Mais Motivador
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quita a menor dívida total primeiro. Dá uma sensação rápida de conquista e elimina boletos da mesa.
              </p>
            </button>
          </div>
        </div>

        {/* Simulador de Aporte Extra */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} /> Aporte Extra / Corte de Ralos
              </h3>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                +{formatBRL(data.extraMonthlyPayment || 0)}/mês
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Economizando em supérfluos ou com bicos, quanto a mais você pode injetar por mês?
            </p>
            <input
              type="range"
              min="0"
              max="1500"
              step="50"
              value={data.extraMonthlyPayment || 0}
              onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div className="flex gap-2 mt-4">
            {[0, 100, 250, 500].map((val) => (
              <button
                key={val}
                onClick={() => setExtraMonthlyPayment(val)}
                className={`flex-1 py-1 text-[11px] rounded-lg border font-medium transition ${
                  (data.extraMonthlyPayment || 0) === val
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                +R${val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados da Linha do Tempo */}
      {payoffSimulation.hasDeficit ? (
        <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-center">
          <AlertTriangle size={36} className="mx-auto text-rose-400 mb-3" />
          <h4 className="text-base font-bold text-rose-300 mb-1">
            Orçamento em Déficit: Quitação Impossibilitada
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Seus custos fixos essenciais somados às parcelas mínimas atuais superam sua renda líquida em{' '}
            <span className="font-bold text-white">{formatBRL(payoffSimulation.deficitAmount)}/mês</span>.
            Você precisa renegociar taxas, cortar ralos ou buscar renda extra emergencial antes de aplicar o plano.
          </p>
        </div>
      ) : totalDebtBalance === 0 ? (
        <div className="p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl text-center">
          <Trophy size={48} className="mx-auto text-emerald-400 mb-3" />
          <h4 className="text-lg font-bold text-white mb-2">Você Não Possui Dívidas Cadastradas!</h4>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-4">
            Seu próximo grande passo é a construção da sua Reserva de Emergência de 6 meses no Tesouro Selic ou CDB de liquidez diária.
          </p>
        </div>
      ) : (
        <>
          {/* Marcos de Vitória (Mês X e Mês Y) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Marco 1: Primeira Dívida Zerada */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-cyan-400">
                <Trophy size={16} /> Marco 1: Primeira Vitória
              </div>
              {payoffSimulation.milestones.length > 0 ? (
                <>
                  <div className="text-2xl font-black text-white mb-1">
                    Mês {payoffSimulation.milestones[0].month}
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {payoffSimulation.milestones[0].debtName} zerada!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Libera +{formatBRL(payoffSimulation.milestones[0].freedAmount)}/mês de parcela para o próximo alvo.
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500">Calculando projeção...</p>
              )}
            </div>

            {/* Marco 2: Liberdade Total de Dívidas */}
            <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
                <Sparkles size={16} /> Marco Final: Liberdade Total
              </div>
              <div className="text-2xl font-black text-emerald-400 mb-1">
                Mês {payoffSimulation.monthsNeeded}
                <span className="text-xs font-normal text-slate-400 ml-1.5">
                  (~{(payoffSimulation.monthsNeeded / 12).toFixed(1)} anos)
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                100% Livre de Dívidas!
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                A partir daqui, todo o fluxo mensal vira patrimônio na sua conta.
              </p>
            </div>

            {/* Marco 3: Reserva de Emergência */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-400">
                <PiggyBank size={16} /> Próxima Fase: Reserva de Emergência
              </div>
              <div className="text-2xl font-black text-white mb-1">
                {formatBRL(emergencyFundTarget)}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Meta de 6 meses de segurança
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Com o dinheiro liberado ({formatBRL(freedMonthlyAfterPayoff)}/mês), você junta a reserva em{' '}
                <span className="text-blue-400 font-bold">{monthsForEmergency} meses</span> após quitar as dívidas!
              </p>
            </div>
          </div>

          {/* Alternador de Visão (Marcos vs Tabela Mês a Mês) */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Evolução da Quitação</h3>
                <p className="text-xs text-slate-400">
                  Total estimado em juros pagos com essa estratégia: ~{formatBRL(payoffSimulation.totalInterest)}
                </p>
              </div>

              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setActiveView('milestones')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    activeView === 'milestones'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Conquistas
                </button>
                <button
                  onClick={() => setActiveView('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    activeView === 'monthly'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mês a Mês
                </button>
              </div>
            </div>

            {/* Visualização 1: Lista de Conquistas */}
            {activeView === 'milestones' && (
              <div className="space-y-3">
                {payoffSimulation.milestones.map((m, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                        M{m.month}
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-white">{m.message}</h5>
                        <p className="text-[11px] text-slate-400">
                          Parcela de {formatBRL(m.freedAmount)} agora soma na bola de neve!
                        </p>
                      </div>
                    </div>
                    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Visualização 2: Tabela de Evolução Mês a Mês */}
            {activeView === 'monthly' && (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 sticky top-0 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Mês</th>
                      <th className="py-2.5 px-3">Saldo Devedor Restante</th>
                      <th className="py-2.5 px-3">Amortização/Pagamento</th>
                      <th className="py-2.5 px-3">Juros no Mês</th>
                      <th className="py-2.5 px-3">Dívidas Ativas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payoffSimulation.monthlyTimeline.slice(0, 48).map((record) => (
                      <tr key={record.month} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-bold text-white">Mês {record.month}</td>
                        <td className="py-2 px-3 font-mono text-emerald-400">
                          {formatBRL(record.remainingTotal)}
                        </td>
                        <td className="py-2 px-3">{formatBRL(record.paymentsThisMonth)}</td>
                        <td className="py-2 px-3 text-rose-400 font-mono">
                          +{formatBRL(record.interestThisMonth)}
                        </td>
                        <td className="py-2 px-3 text-slate-400">{record.activeDebtsCount} ativas</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
