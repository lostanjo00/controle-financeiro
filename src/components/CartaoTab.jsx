import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import {
  formatBRL,
  parseInvoiceText,
  autoCategorizePurchase,
  cleanMerchantTitle,
  generateSograWhatsAppMessage,
} from '../utils/financeCalculations'
import {
  CreditCard,
  Sparkles,
  Search,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sliders,
  PieChart,
  ShoppingBag,
  Flame,
  Scissors,
  ExternalLink,
  Brain,
  X,
  User,
  Users,
  HeartHandshake,
  MessageCircle,
  Send,
} from 'lucide-react'

export const CartaoTab = () => {
  const {
    data,
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
  } = useFinance()

  // Sub-abas de visualização: 'all' | 'me' | 'sogra'
  const [activeViewTab, setActiveViewTab] = useState('all')

  // Modos de entrada: 'auto' | 'manual'
  const [inputMode, setInputMode] = useState('auto')
  const [pasteText, setPasteText] = useState('')
  const [importFeedback, setImportFeedback] = useState(null)

  // Assistente em Linguagem Natural
  const [nlpInput, setNlpInput] = useState('')
  const [nlpFeedback, setNlpFeedback] = useState(null)

  // Form manual
  const [manualTitle, setManualTitle] = useState('')
  const [manualAmount, setManualAmount] = useState('')
  const [manualCategory, setManualCategory] = useState('Alimentação Fora & Delivery')
  const [manualOwner, setManualOwner] = useState('me')

  // Simulador de Corte
  const [cutPercentage, setCutPercentage] = useState(30)

  // Modal de Regras Aprendidas
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false)
  const [newRuleTerm, setNewRuleTerm] = useState('')
  const [newRuleCategory, setNewRuleCategory] = useState('Transporte & Combustível')

  // Notificação de aprendizado
  const [learnedNotification, setLearnedNotification] = useState(null)

  const categoriesList = [
    'Alimentação Fora & Delivery',
    'Mercado Essencial',
    'Educação Essencial',
    'Transporte & Combustível',
    'Compras & Vestuário',
    'Lazer & Entretenimento',
    'Assinaturas & Serviços',
    'Farmácia & Saúde',
    'Outros Gastos',
  ]

  // Envio rápido via Linguagem Natural
  const handleNaturalLanguageSubmit = (e) => {
    e.preventDefault()
    if (!nlpInput.trim()) return

    const result = addNaturalLanguagePurchase(nlpInput.trim())
    if (result) {
      setNlpFeedback({
        type: 'success',
        message: `Lançado com sucesso! "${result.title}" de ${formatBRL(result.amount)} classificado como [${
          result.owner === 'sogra' ? '👥 Gasto de Outros (Reembolso)' : '👤 Meu Gasto (Eu)'
        }] na categoria "${result.category}".`,
      })
      setNlpInput('')
      setTimeout(() => setNlpFeedback(null), 5000)
    } else {
      setNlpFeedback({
        type: 'error',
        message: 'Não consegui identificar o valor. Exemplo: "Gastei 150 no cartão na farmácia, mas foi para um amigo"',
      })
    }
  }

  // Processar texto automático colado
  const handleProcessPastedText = () => {
    if (!pasteText.trim()) return

    const parsed = parseInvoiceText(pasteText, data.customRules || {}, 'me')
    if (parsed.length === 0) {
      setImportFeedback({
        type: 'error',
        message: 'Nenhuma compra reconhecida. Certifique-se de colar as linhas com valores (ex: "Posto Grupo 3S R$ 120,00").',
      })
      return
    }

    addBulkCardPurchases(parsed)
    setImportFeedback({
      type: 'success',
      message: `Sucesso! ${parsed.length} compras identificadas e categorizadas.`,
    })
    setPasteText('')
    setTimeout(() => setImportFeedback(null), 4000)
  }

  // Upload de arquivo CSV / TXT
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      const parsed = parseInvoiceText(content, data.customRules || {}, 'me')
      if (parsed.length > 0) {
        addBulkCardPurchases(parsed)
        setImportFeedback({
          type: 'success',
          message: `${parsed.length} compras importadas do arquivo com sucesso!`,
        })
      } else {
        setImportFeedback({
          type: 'error',
          message: 'Não foi possível ler compras no arquivo selecionado.',
        })
      }
    }
    reader.readAsText(file)
  }

  // Inserção Manual
  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualTitle.trim() || !manualAmount) return

    const catInfo = autoCategorizePurchase(manualTitle, data.customRules || {})

    addCardPurchase({
      title: manualTitle.trim(),
      amount: parseFloat(manualAmount),
      category: manualCategory || catInfo.category,
      isEssential:
        manualCategory === 'Mercado Essencial' ||
        manualCategory === 'Farmácia & Saúde' ||
        manualCategory === 'Transporte & Combustível' ||
        manualCategory === 'Educação Essencial',
      owner: manualOwner,
      date: new Date().toISOString(),
    })

    setManualTitle('')
    setManualAmount('')
  }

  // Alterar categoria de uma compra na lista e ensinar o app
  const handleChangeCategory = (purchase, newCat) => {
    const isEssential =
      newCat === 'Mercado Essencial' ||
      newCat === 'Farmácia & Saúde' ||
      newCat === 'Transporte & Combustível' ||
      newCat === 'Educação Essencial'

    updateCardPurchase(purchase.id, {
      category: newCat,
      isEssential,
    })

    const cleanTerm = cleanMerchantTitle(purchase.title).trim()
    if (cleanTerm.length >= 2) {
      setCustomRule(cleanTerm, newCat)
      setLearnedNotification({
        term: cleanTerm,
        category: newCat,
      })
      setTimeout(() => setLearnedNotification(null), 3500)
    }
  }

  const handleGoogleSearch = (title) => {
    const query = encodeURIComponent(`${title} o que e fatura cartao cnpj`)
    window.open(`https://www.google.com/search?q=${query}`, '_blank')
  }

  const handleSendWhatsAppSogra = () => {
    const msg = generateSograWhatsAppMessage(cardAnalysis.sograPurchases, cardAnalysis.sograTotal)
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleCopyWhatsAppMessage = () => {
    const msg = generateSograWhatsAppMessage(cardAnalysis.sograPurchases, cardAnalysis.sograTotal)
    navigator.clipboard.writeText(msg)
    alert('Texto do extrato copiado! Basta colar no WhatsApp da pessoa para acerto.')
  }

  // Lista de compras filtrada pela sub-aba
  const displayedPurchases = (data.cardPurchases || []).filter((item) => {
    if (activeViewTab === 'me') return (item.owner || 'me') === 'me'
    if (activeViewTab === 'sogra') return item.owner === 'sogra'
    return true
  })

  const rulesCount = Object.keys(data.customRules || {}).length
  const estimatedSavings = (cardAnalysis.superfluousTotal * cutPercentage) / 100
  const newMyInvoiceTotal = Math.max(0, cardAnalysis.myNetTotal - estimatedSavings)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner Principal com Foco no Cartão Compartilhado */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Cartão de Crédito Compartilhado</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Divisão Automática (Eu vs. Outros)
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Isole os gastos de outras pessoas ou dependentes com 1 clique para que o seu orçamento pessoal considere <strong className="text-white">apenas o que você realmente gastou</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsRulesModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 transition"
            title="Ver palavras e regras automáticas de inteligência"
          >
            <Brain size={14} className="text-indigo-400" />
            <span>Memória do App ({rulesCount})</span>
          </button>

          {data.cardPurchases?.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Deseja limpar todos os lançamentos do cartão?')) {
                  clearCardPurchases()
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Trash2 size={13} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* 🗣️ Entrada Inteligente em Linguagem Natural */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-md">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span>Lançamento Rápido em Linguagem Natural</span>
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Escreva como se estivesse conversando. Se disser "outros", "foi fulano", "amigo" ou "minha sogra", o app classifica automaticamente como gasto de terceiros!
        </p>

        <form onSubmit={handleNaturalLanguageSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Ex: Gastei 150 no cartão na farmácia, mas foi para um amigo"
            value={nlpInput}
            onChange={(e) => setNlpInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-purple-950 shrink-0"
          >
            <Send size={14} /> Registrar Compra
          </button>
        </form>

        {nlpFeedback && (
          <div
            className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              nlpFeedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {nlpFeedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {nlpFeedback.message}
          </div>
        )}
      </div>

      {/* Sub-Navegação por Titularidade (Meus Gastos vs Gastos de Outros) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-2 sm:p-3 rounded-2xl">
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveViewTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewTab === 'all'
                ? 'bg-slate-700 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Todos os Gastos ({data.cardPurchases?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('me')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewTab === 'me'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <User size={14} />
            <span>Meus Gastos (Eu) ({cardAnalysis.myCount})</span>
            <span className="font-mono ml-1 font-semibold">{formatBRL(cardAnalysis.myNetTotal)}</span>
          </button>

          <button
            onClick={() => setActiveViewTab('sogra')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeViewTab === 'sogra'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-950 text-purple-400 hover:bg-purple-950/40'
            }`}
          >
            <HeartHandshake size={14} />
            <span>Gastos de Outros ({cardAnalysis.sograCount})</span>
            <span className="font-mono ml-1 font-semibold">{formatBRL(cardAnalysis.sograTotal)}</span>
          </button>
        </div>

        {/* Botão de Enviar Cobrança no WhatsApp para Outros */}
        {cardAnalysis.sograTotal > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSendWhatsAppSogra}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-950"
              title="Abrir WhatsApp com o extrato formatado para acerto"
            >
              <MessageCircle size={14} />
              <span>Cobrança / Acerto</span>
            </button>
            <button
              onClick={handleCopyWhatsAppMessage}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition"
              title="Copiar texto para colar"
            >
              Copiar
            </button>
          </div>
        )}
      </div>

      {/* Espaço Detalhado de Outros */}
      {activeViewTab === 'sogra' && (
        <div className="bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 border border-purple-500/40 p-5 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake size={18} className="text-purple-400" />
                <span>Extrato Detalhado de Compras de Outros (A Reembolsar)</span>
              </h3>
              <p className="text-xs text-slate-300">
                Estes valores estão <strong className="text-emerald-400">100% isolados e deduzidos</strong> do seu orçamento mensal.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total a ser reembolsado por outros:</span>
              <span className="text-xl font-black text-purple-400 font-mono">
                {formatBRL(cardAnalysis.sograTotal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Métricas Pessoais da Fatura */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Minha Fatura Líquida</span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {formatBRL(cardAnalysis.myReconciledNetTotal)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {cardAnalysis.myCount} compras pessoais
          </p>
        </div>

        <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-medium">Meus Supérfluos & Lazer</span>
            <Flame size={16} className="text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            {formatBRL(cardAnalysis.superfluousTotal)}
          </div>
          <p className="text-[11px] text-rose-300/80 mt-0.5">
            {cardAnalysis.myNetTotal > 0 ? ((cardAnalysis.superfluousTotal / cardAnalysis.myNetTotal) * 100).toFixed(0) : 0}% dos seus gastos pessoais
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Meus Essenciais (Mercado/Saúde/Educação)</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {formatBRL(cardAnalysis.essentialTotal)}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Sobrevivência & Futuro (Não cortáveis)</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-medium">Potencial de Economia ({cutPercentage}%)</span>
            <Scissors size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            +{formatBRL(estimatedSavings)}
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-0.5">Dinheiro livre para poupança ou dívidas</p>
        </div>
      </div>

      {/* Parecer do Consultor & Simulador de Corte */}
      {cardAnalysis.myNetTotal > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-start gap-3.5">
          <Sparkles size={22} className="text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-indigo-300 mb-1 flex items-center gap-2">
              <span>Parecer do Especialista em Cartão de Crédito</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              {cardAnalysis.verdict}
            </p>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders size={14} className="text-emerald-400" />
                  Simule cortar <strong className="text-emerald-400">{cutPercentage}%</strong> dos supérfluos no próximo mês:
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Sua fatura cairia para {formatBRL(newMyInvoiceTotal)}!
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={cutPercentage}
                onChange={(e) => setCutPercentage(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Onde Estamos Gastando Mais? (Gráfico de Ranking) */}
      {cardAnalysis.categories.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
            <PieChart size={18} className="text-cyan-400" />
            <span>Onde estamos gastando mais? (Ranking da Fatura Pessoal)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Categorias ordenadas pelo maior volume financeiro de saída.
          </p>

          <div className="space-y-3">
            {cardAnalysis.categories.map((cat, idx) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    {cat.name}
                  </span>
                  <span className="font-bold text-white font-mono">
                    {formatBRL(cat.amount)}{' '}
                    <span className="text-slate-400 font-normal">({cat.percentage.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-rose-500'
                        : idx === 1
                        ? 'bg-amber-500'
                        : idx === 2
                        ? 'bg-cyan-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de Entrada: Scanner de Fatura ou Inserção Manual */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-white text-base">Adicionar Compras à Fatura</h3>
            <p className="text-xs text-slate-400">Importe em lote ou adicione compras individuais</p>
          </div>

          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setInputMode('auto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                inputMode === 'auto'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} /> Scanner / Colar Fatura
            </button>
            <button
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                inputMode === 'manual'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus size={14} /> Digitação Manual
            </button>
          </div>
        </div>

        {importFeedback && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
              importFeedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {importFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {importFeedback.message}
          </div>
        )}

        {inputMode === 'auto' && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-300 block">
              Copie o texto das compras no app do seu banco e cole aqui (adicione "outros" na linha para compras de terceiros):
            </label>

            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Exemplo de fatura colada:
02/11 GRUPO 3S POSTO R$ 180,00
05/11 Droga Raia R$ 150,00 outros
07/11 iFood Restaurante R$ 58,90
08/11 Supermercado Extra R$ 220,00 outros"
              rows={4}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={handleProcessPastedText}
                disabled={!pasteText.trim()}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-950"
              >
                <Sparkles size={15} /> Processar e Categorizar com IA
              </button>

              <label className="cursor-pointer py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition">
                <Upload size={14} /> Importar CSV/TXT
                <input type="file" accept=".csv,.txt,.ofx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {inputMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Estabelecimento / Item</label>
              <input
                type="text"
                placeholder="Ex: Farmácia, Mercado, iFood"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Categoria</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">De quem é esse gasto?</label>
              <select
                value={manualOwner}
                onChange={(e) => setManualOwner(e.target.value)}
                className="w-full bg-slate-950 border border-purple-500/60 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-purple-400"
              >
                <option value="me">👤 Meu Gasto Pessoal (Eu)</option>
                <option value="sogra">👥 Gasto de Outros (A Reembolsar)</option>
              </select>
            </div>

            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950"
              >
                <Plus size={15} /> Adicionar Compra
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lista de Compras Lançadas com Toggle de Titularidade (Eu vs Outros) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText size={17} className="text-slate-400" />
              <span>
                {activeViewTab === 'me'
                  ? 'Minhas Compras Pessoais (Eu)'
                  : activeViewTab === 'sogra'
                  ? 'Compras de Outros (A Reembolsar)'
                  : 'Extrato Completo de Compras'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              💡 Clique no botão de titularidade (<span className="text-indigo-400 font-bold">Eu</span> ou <span className="text-purple-400 font-bold">Outros</span>) para trocar de dono instantaneamente!
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {displayedPurchases.length} itens listados
          </span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {displayedPurchases.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhuma compra encontrada nesta exibição.
            </div>
          ) : (
            displayedPurchases.map((purchase) => {
              const isSogra = purchase.owner === 'sogra'

              return (
                <div
                  key={purchase.id}
                  className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSogra
                      ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-500/60'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Ícone, Nome, Titularidade e Google */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePurchaseOwner(purchase.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                        isSogra
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                          : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Clique para alternar se este gasto é Meu (Eu) ou de Outros"
                    >
                      {isSogra ? <Users size={12} /> : <User size={12} />}
                      <span>{isSogra ? 'Outros' : 'Eu'}</span>
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {purchase.title}
                        </span>
                        <button
                          onClick={() => handleGoogleSearch(purchase.title)}
                          className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] flex items-center gap-1 transition"
                          title="Pesquisar no Google"
                        >
                          <Search size={10} />
                          <span>Google</span>
                          <ExternalLink size={9} />
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className={purchase.isEssential ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                          {purchase.isEssential ? '● Essencial' : '● Supérfluo'}
                        </span>
                        {isSogra && (
                          <span className="text-purple-300 font-semibold">• Deduzido do meu custo (A reembolsar)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Seletor Rápido de Categoria + Valor + Excluir */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
                    <select
                      value={purchase.category}
                      onChange={(e) => handleChangeCategory(purchase, e.target.value)}
                      className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none transition"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <span
                      className={`text-xs sm:text-sm font-bold font-mono min-w-[75px] text-right ${
                        isSogra ? 'text-purple-400' : 'text-white'
                      }`}
                    >
                      {formatBRL(purchase.amount)}
                    </span>

                    <button
                      onClick={() => removeCardPurchase(purchase.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-400 transition rounded-lg hover:bg-slate-800"
                      title="Excluir lançamento"
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

      {/* Modal de Regras Aprendidas */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setIsRulesModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Brain size={20} className="text-indigo-400" />
              <span>Memória Inteligente do App</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Palavras e termos que o app categoriza automaticamente.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {Object.keys(data.customRules || {}).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Nenhuma regra personalizada cadastrada ainda.
                </div>
              ) : (
                Object.entries(data.customRules || {}).map(([term, category]) => (
                  <div
                    key={term}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white capitalize">"{term}"</span>
                      <span className="text-slate-400 mx-1.5">→</span>
                      <span className="text-indigo-300 font-medium">{category}</span>
                    </div>
                    <button
                      onClick={() => removeCustomRule(term)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 flex justify-end">
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
