import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatBRL } from '../utils/financeCalculations'
import {
  Bot,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  FileText,
} from 'lucide-react'
import { ReportModal } from './ReportModal'

export const ConsultorTab = () => {
  const {
    totalIncome,
    totalFixedExpenses,
    totalDebtBalance,
    totalDebtMinPayments,
    cashflowSurplus,
    priorityCounts,
    payoffSimulation,
    leakStats,
    data,
  } = useFinance()

  const [isReportOpen, setIsReportOpen] = useState(false)

  const fixedPercentage = totalIncome > 0 ? (totalFixedExpenses / totalIncome) * 100 : 0
  const debtServicePercentage = totalIncome > 0 ? (totalDebtMinPayments / totalIncome) * 100 : 0

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner de Diagnóstico do Consultor */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-950">
              <Bot size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Diagnóstico & Parecer do Consultor Pessoal
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  100% Livre de Julgamentos
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Aqui está a leitura analítica e fria da sua situação atual com as ações exatas que você deve tomar para recuperar o controle total do seu dinheiro.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReportOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition self-start md:self-auto shrink-0"
          >
            <FileText size={16} /> Salvar Relatório em PDF
          </button>
        </div>

        {/* Cartões do Parecer Diagnóstico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Diagnóstico de Renda vs Custos */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target size={15} className="text-blue-400" /> Custos Fixos Essenciais
            </h4>
            <div className="text-lg font-bold text-white mb-1">
              {fixedPercentage.toFixed(0)}% da sua renda
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {fixedPercentage <= 50
                ? 'Excelente! Seus custos essenciais estão dentro da margem segura ideal (até 50%).'
                : fixedPercentage <= 70
                ? 'Atenção moderada. Seus custos fixos estão consumindo uma fatia considerável da renda.'
                : 'Alerta alto! Mais de 70% da sua renda está comprometida antes mesmo das dívidas.'}
            </p>
          </div>

          {/* Diagnóstico de Dívidas */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-rose-400" /> Comprometimento com Dívidas
            </h4>
            <div className="text-lg font-bold text-white mb-1">
              {debtServicePercentage.toFixed(0)}% da sua renda
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {priorityCounts.p1 > 0
                ? `Atenção Crítica: Você tem ${priorityCounts.p1} dívida(s) de Urgência Máxima (juros compostos abusivos como rotativo ou cheque especial).`
                : 'Muito bom! Você não tem dívidas de rotativo/juros abusivos sangrando o orçamento.'}
            </p>
          </div>

          {/* Capacidade de Saída */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={15} className="text-emerald-400" /> Fôlego de Ataque
            </h4>
            <div className="text-lg font-bold text-emerald-400 mb-1">
              {cashflowSurplus >= 0 ? formatBRL(cashflowSurplus) : 'Déficit Negativo'}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {cashflowSurplus > 0
                ? `Você tem ${formatBRL(cashflowSurplus)}/mês de sobra para aplicar no método escolhido e antecipar parcelas.`
                : 'O orçamento está deficitário. Estancar os ralos financeiros é urgente para gerar folga.'}
            </p>
          </div>
        </div>

        {/* Plano de Ação em 3 Etapas Imediatas */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Suas 3 Ações Mais Urgentes para esta Semana</span>
          </h3>

          <div className="space-y-4">
            {/* Passo 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h5 className="font-bold text-white text-sm mb-1">
                  Blindagem Absoluta dos Custos Essenciais
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nunca atrase água, luz, aluguel ou o mercado básico para pagar a fatura de cartão de crédito. Se o dinheiro faltar, os bancos devem esperar a negociação; a sua família e moradia vêm sempre primeiro.
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h5 className="font-bold text-white text-sm mb-1">
                  Ataque Mortal às Dívidas de Prioridade 1 (Rotativo e Cheque Especial)
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  O rotativo do cartão e o cheque especial cobram entre 8% e 15% ao mês (mais de 300% ao ano). Não pague o valor mínimo repetidamente! Ligue para o banco ou use a portabilidade de crédito para unificar essa dívida em um empréstimo com parcelas fixas a taxas bem menores (ex: 2% a 3% a.m.).
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h5 className="font-bold text-white text-sm mb-1">
                  Desafio dos 14 Dias: Estanque R$ {leakStats.monthlyProjection > 0 ? (leakStats.monthlyProjection * 0.4).toFixed(0) : '200'} dos Ralos
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Utilize a aba "Ralos 14 Dias" toda vez que for pedir comida por app ou comprar supérfluos. Cortar apenas 40% desses pequenos vazamentos vai injetar caixa imediato no seu plano de quitação.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Roteiro Prático: Como Negociar com o Banco */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <PhoneCall size={18} className="text-cyan-400" />
            <span>Guia Prático: Como Falar com o Banco para Reduzir Juros</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Roteiro objetivo de conversa para você usar ao ligar no SAC ou comparecer à agência:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs sm:text-sm text-slate-300 font-mono space-y-2">
            <p className="text-cyan-300 font-semibold font-sans">🗣️ Script Sugerido:</p>
            <p className="leading-relaxed">
              "Olá! Estou revisando meu orçamento e a taxa do rotativo / cheque especial atual está incompatível com a minha renda. Quero pagar o saldo devedor de forma honesta, mas não consigo nessas condições. Gostaria de parcelar o saldo total em parcelas fixas com juros reduzidos (CUC) ou solicitar portabilidade da dívida para outra instituição financeira."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-400">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">✅ Se aceitarem uma proposta boa:</span>
              Exija que congelem o limite para você não cair novamente na tentação do rotativo até terminar de quitar.
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">⏳ Se recusarem:</span>
              Aguarde ofertas de feirões como o Serasa Limpa Nome ou Desenrola Brasil, onde descontos chegam a 70% a 90% do valor dos juros.
            </div>
          </div>
        </div>
      </div>

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </>
  )
}
