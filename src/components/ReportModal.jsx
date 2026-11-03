import React from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatBRL } from '../utils/financeCalculations'
import { FileText, Printer, X, CheckCircle2 } from 'lucide-react'

export const ReportModal = ({ isOpen, onClose }) => {
  const {
    data,
    totalIncome,
    totalFixedExpenses,
    totalDebtBalance,
    totalDebtMinPayments,
    cashflowSurplus,
    prioritizedDebts,
    payoffSimulation,
    leakStats,
    cardAnalysis,
  } = useFinance()

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative">
        {/* Barra de Ações Superior (Não sai na impressão) */}
        <div className="no-print p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Relatório Diagnóstico Financeiro Oficial
              </h3>
              <p className="text-xs text-slate-400">
                Gere o arquivo PDF para arquivar no computador ou celular.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition"
            >
              <Printer size={16} /> Salvar como PDF / Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório */}
        <div className="print-container flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-200 bg-slate-950/40">
          {/* Cabeçalho do Documento */}
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-1">
                Consultoria Financeira Pessoal • Antigravity
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Dossiê Diagnóstico & Plano de Ação Financeira
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Raio-X de Custos, Matriz de Quitação de Dívidas e Cartão Compartilhado
              </p>
            </div>
            <div className="text-right sm:self-auto self-start">
              <span className="text-xs text-slate-400 block">Data de Emissão:</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-white">{today}</span>
            </div>
          </div>

          {/* 1. Resumo Executivo / Raio-X */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2 border-l-2 border-emerald-500 pl-2">
              1. Raio-X do Orçamento Mensal
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Renda Líquida</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {formatBRL(totalIncome)}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Custos Fixos Essenciais</span>
                <span className="text-base sm:text-lg font-bold text-blue-400">
                  {formatBRL(totalFixedExpenses)}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Parcelas das Dívidas</span>
                <span className="text-base sm:text-lg font-bold text-amber-400">
                  {formatBRL(totalDebtMinPayments)}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Saldo Livre (Folga)</span>
                <span
                  className={`text-base sm:text-lg font-bold ${
                    cashflowSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatBRL(cashflowSurplus)}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Custos Fixos Essenciais */}
          {data.fixedExpenses?.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 border-l-2 border-blue-500 pl-2">
                2. Detalhamento dos Custos Fixos Essenciais
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2 border border-slate-800">Item / Despesa</th>
                      <th className="p-2 border border-slate-800">Classificação</th>
                      <th className="p-2 border border-slate-800 text-right">Valor Mensal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fixedExpenses.map((exp) => (
                      <tr key={exp.id} className="border-b border-slate-800/60">
                        <td className="p-2 font-medium text-slate-200">{exp.name}</td>
                        <td className="p-2 text-emerald-400 text-[11px]">Blindado (Essencial)</td>
                        <td className="p-2 text-right font-bold text-white font-mono">
                          {formatBRL(exp.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 font-bold">
                      <td colSpan={2} className="p-2 text-slate-300">Total dos Custos Fixos</td>
                      <td className="p-2 text-right text-blue-400 font-mono">
                        {formatBRL(totalFixedExpenses)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Matriz de Priorização de Dívidas */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 border-l-2 border-rose-500 pl-2">
              3. Matriz de Priorização de Dívidas
            </h2>
            {prioritizedDebts.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma dívida cadastrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2 border border-slate-800">Dívida</th>
                      <th className="p-2 border border-slate-800">Urgência</th>
                      <th className="p-2 border border-slate-800">Taxa Juros</th>
                      <th className="p-2 border border-slate-800">Parcela Mensal</th>
                      <th className="p-2 border border-slate-800 text-right">Saldo Devedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prioritizedDebts.map((debt) => (
                      <tr key={debt.id} className="border-b border-slate-800/60">
                        <td className="p-2 font-bold text-white">{debt.name}</td>
                        <td className="p-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              debt.priority.level === 1
                                ? 'text-rose-400'
                                : debt.priority.level === 2
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {debt.priority.label}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-amber-400">{debt.interestRate}% a.m.</td>
                        <td className="p-2 font-mono text-slate-200">{formatBRL(debt.minPayment)}</td>
                        <td className="p-2 text-right font-bold font-mono text-white">
                          {formatBRL(debt.balance)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900 font-bold">
                      <td colSpan={3} className="p-2 text-slate-300">Total Passivo & Parcelas</td>
                      <td className="p-2 text-amber-400 font-mono">{formatBRL(totalDebtMinPayments)}</td>
                      <td className="p-2 text-right text-rose-400 font-mono">
                        {formatBRL(totalDebtBalance)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Diagnóstico de Cartão de Crédito Compartilhado (Eu vs. Outros) */}
          {(cardAnalysis.grossTotal > 0 || cardAnalysis.invoiceTotal > 0) && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 border-l-2 border-indigo-500 pl-2">
                4. Cartão Compartilhado & Gastos de Terceiros / Outros
              </h2>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Fatura Bruta Total (Banco):</span>
                    <span className="text-base font-bold text-white font-mono">
                      {formatBRL(cardAnalysis.invoiceTotal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-300 block text-[11px]">(-) Gastos de Outros (A Reembolsar):</span>
                    <span className="text-base font-bold text-purple-400 font-mono">
                      -{formatBRL(cardAnalysis.sograTotal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-300 block text-[11px]">(=) Minha Fatura Líquida (Eu):</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {formatBRL(cardAnalysis.myReconciledNetTotal)}
                    </span>
                  </div>
                </div>

                {/* Detalhe dos Itens de Outros para Comprovante */}
                {cardAnalysis.sograPurchases.length > 0 && (
                  <div>
                    <span className="font-bold text-purple-300 block mb-1 text-xs">
                      Itens Comprados por Outros (Total a Transferir/Reembolsar: {formatBRL(cardAnalysis.sograTotal)}):
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {cardAnalysis.sograPurchases.map((sp) => (
                        <li key={sp.id}>
                          {sp.title}: <strong className="font-mono">{formatBRL(sp.amount)}</strong> ({sp.category})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <strong>Parecer:</strong> {cardAnalysis.verdict}
                </p>
              </div>
            </div>
          )}

          {/* 5. Linha do Tempo e Projeção de Quitação */}
          {totalDebtBalance > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2 border-l-2 border-cyan-500 pl-2">
                5. Linha do Tempo de Quitação (Projeção)
              </h2>
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
                <p>
                  <strong>Estratégia Aplicada:</strong>{' '}
                  {data.strategy === 'avalanche' ? 'Método Avalanche (Menor Gasto com Juros)' : 'Método Bola de Neve (Maior Motivação Psicológica)'}
                </p>
                {payoffSimulation.milestones?.length > 0 && (
                  <p>
                    <strong>Mês X (Primeira Conquista):</strong> No{' '}
                    <span className="text-cyan-400 font-bold">Mês {payoffSimulation.milestones[0].month}</span> a dívida{' '}
                    <em>"{payoffSimulation.milestones[0].debtName}"</em> será zerada, liberando +{formatBRL(payoffSimulation.milestones[0].freedAmount)}/mês.
                  </p>
                )}
                <p>
                  <strong>Mês Y (Liberdade Financeira Total):</strong> No{' '}
                  <span className="text-emerald-400 font-bold">Mês {payoffSimulation.monthsNeeded}</span> você estará 100% livre de dívidas!
                </p>
              </div>
            </div>
          )}

          {/* 6. Parecer & 3 Ações Mais Urgentes */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={16} /> 6. Suas 3 Ações Imediatas Recomendadas
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>Cobrança Pontual da Fatura Compartilhada:</strong> Envie o resumo detalhado das compras compartilhadas antes da data de vencimento para garantir que o dinheiro do reembolso entre na sua conta a tempo.
              </li>
              <li>
                <strong>Blindagem de Sobrevivência:</strong> Priorize pagar mercado, luz, água e moradia antes de qualquer pagamento mínimo de cartão ou banco.
              </li>
              <li>
                <strong>Ataque às Dívidas de Prioridade 1:</strong> Não pague o rotativo repetidamente. Ligue no banco e peça parcelamento com juros fixos reduzidos ou portabilidade de crédito.
              </li>
            </ol>
          </div>

          {/* Rodapé Oficial */}
          <div className="text-center pt-4 border-t border-slate-800/80 text-[10px] text-slate-500">
            Documento gerado automaticamente pela plataforma Finanças & Liberdade • Armazenamento local 100% confidencial.
          </div>
        </div>
      </div>
    </div>
  )
}
