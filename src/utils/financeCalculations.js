/**
 * Utilitários e Funções Matemáticas de Diagnóstico Financeiro
 */

export const formatBRL = (val) => {
  if (isNaN(val) || val === null || val === undefined) return 'R$ 0,00'
  return Number(val).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const parseNumber = (val) => {
  if (typeof val === 'number') return val
  if (!val) return 0
  const clean = val.toString().replace(/[R$\s.]/g, '').replace(',', '.')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

/**
 * Classificação rigorosa de prioridade de dívida:
 * Prioridade 1: Urgência Máxima (Juros abusivos, rotativo de cartão, cheque especial)
 * Prioridade 2: Urgência Média (Juros controlados, consignados, financiamentos)
 * Prioridade 3: Essenciais (Contas de sobrevivência - luz, água, moradia)
 */
export const classifyPriority = (debt) => {
  const rate = Number(debt.interestRate) || 0
  const type = (debt.category || '').toLowerCase()

  if (type === 'essencial' || debt.isEssential) {
    return {
      level: 3,
      label: 'Prioridade 3: Essencial',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Conta básica de sobrevivência. Jamais corte ou deixe acumular para pagar bancos.',
    }
  }

  if (
    rate >= 5 ||
    type.includes('rotativo') ||
    type.includes('cartao') ||
    type.includes('cheque') ||
    type.includes('agiota') ||
    type.includes('pessoal')
  ) {
    return {
      level: 1,
      label: 'Prioridade 1: Urgência Máxima',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Juros abusivos ou perigosos. Esta dívida sangra o orçamento e deve ser atacada primeiro.',
    }
  }

  return {
    level: 2,
    label: 'Prioridade 2: Urgência Média',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Juros controlados ou financiamento de longo prazo. Mantenha em dia enquanto ataca a Prioridade 1.',
  }
}

/**
 * Simulação da Linha do Tempo de Quitação (Bola de Neve vs Avalanche)
 */
export const simulatePayoff = ({
  debts = [],
  monthlyIncome = 0,
  fixedExpenses = 0,
  extraMonthlyPayment = 0,
  strategy = 'avalanche',
  maxMonths = 120,
}) => {
  const activeDebts = debts
    .filter((d) => Number(d.balance) > 0)
    .map((d) => ({
      ...d,
      balance: Number(d.balance),
      minPayment: Number(d.minPayment) || 0,
      interestRate: Number(d.interestRate) || 0,
      originalBalance: Number(d.balance),
      paidOffMonth: null,
      totalInterestPaid: 0,
    }))

  if (activeDebts.length === 0) {
    return {
      success: true,
      monthsNeeded: 0,
      totalInterest: 0,
      milestones: [],
      monthlyTimeline: [],
      hasDeficit: false,
      freedCashflow: monthlyIncome - fixedExpenses,
    }
  }

  const totalMinPayments = activeDebts.reduce((acc, d) => acc + d.minPayment, 0)
  const disposableIncome = monthlyIncome - fixedExpenses
  const surplusPayment = Math.max(0, disposableIncome - totalMinPayments) + (Number(extraMonthlyPayment) || 0)

  if (disposableIncome < totalMinPayments && surplusPayment <= 0) {
    return {
      success: false,
      monthsNeeded: Infinity,
      totalInterest: 0,
      milestones: [],
      monthlyTimeline: [],
      hasDeficit: true,
      deficitAmount: totalMinPayments - disposableIncome,
      freedCashflow: 0,
    }
  }

  let currentDebts = JSON.parse(JSON.stringify(activeDebts))
  const monthlyTimeline = []
  const milestones = []
  let totalInterestAccumulated = 0
  let freedSnowballCash = 0

  for (let month = 1; month <= maxMonths; month++) {
    const monthRecord = {
      month,
      remainingTotal: 0,
      interestThisMonth: 0,
      paymentsThisMonth: 0,
      activeDebtsCount: 0,
      debtsSnapshot: [],
    }

    currentDebts.forEach((debt) => {
      if (debt.balance > 0) {
        const monthlyRate = (debt.interestRate || 0) / 100
        const interest = debt.balance * monthlyRate
        debt.balance += interest
        debt.totalInterestPaid += interest
        totalInterestAccumulated += interest
        monthRecord.interestThisMonth += interest
      }
    })

    currentDebts.forEach((debt) => {
      if (debt.balance > 0) {
        const payment = Math.min(debt.balance, debt.minPayment)
        debt.balance -= payment
        monthRecord.paymentsThisMonth += payment
        if (debt.balance <= 0.01) {
          debt.balance = 0
          if (!debt.paidOffMonth) {
            debt.paidOffMonth = month
            freedSnowballCash += debt.minPayment
            milestones.push({
              month,
              debtName: debt.name,
              message: `Dívida "${debt.name}" quitada no Mês ${month}!`,
              freedAmount: debt.minPayment,
            })
          }
        }
      }
    })

    let availableExtra = surplusPayment + freedSnowballCash
    const remainingDebts = currentDebts.filter((d) => d.balance > 0)

    if (strategy === 'avalanche') {
      remainingDebts.sort((a, b) => b.interestRate - a.interestRate || b.balance - a.balance)
    } else {
      remainingDebts.sort((a, b) => a.balance - b.balance || b.interestRate - a.interestRate)
    }

    for (const targetDebt of remainingDebts) {
      if (availableExtra <= 0) break
      const payment = Math.min(targetDebt.balance, availableExtra)
      targetDebt.balance -= payment
      availableExtra -= payment
      monthRecord.paymentsThisMonth += payment

      if (targetDebt.balance <= 0.01) {
        targetDebt.balance = 0
        if (!targetDebt.paidOffMonth) {
          targetDebt.paidOffMonth = month
          freedSnowballCash += targetDebt.minPayment
          milestones.push({
            month,
            debtName: targetDebt.name,
            message: `Dívida "${targetDebt.name}" zerada com sucesso no Mês ${month}!`,
            freedAmount: targetDebt.minPayment,
          })
        }
      }
    }

    const remainingTotal = currentDebts.reduce((sum, d) => sum + d.balance, 0)
    monthRecord.remainingTotal = Math.max(0, remainingTotal)
    monthRecord.activeDebtsCount = currentDebts.filter((d) => d.balance > 0).length
    monthRecord.debtsSnapshot = currentDebts.map((d) => ({
      name: d.name,
      balance: Math.max(0, d.balance),
    }))

    monthlyTimeline.push(monthRecord)

    if (remainingTotal <= 0.01) {
      return {
        success: true,
        monthsNeeded: month,
        totalInterest: totalInterestAccumulated,
        milestones,
        monthlyTimeline,
        hasDeficit: false,
        freedCashflow: disposableIncome,
      }
    }
  }

  return {
    success: false,
    monthsNeeded: maxMonths,
    totalInterest: totalInterestAccumulated,
    milestones,
    monthlyTimeline,
    hasDeficit: false,
    freedCashflow: disposableIncome,
    exceededMax: true,
  }
}

/**
 * Cálculo do Diário de Ralos Financeiros (14 Dias)
 */
export const calculateLeakImpact = (leaks = []) => {
  const now = new Date()
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const validLeaks = leaks.filter((item) => {
    if (!item.date) return true
    const itemDate = new Date(item.date)
    return itemDate >= fourteenDaysAgo
  })

  const totalSpent14Days = validLeaks.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  const count = validLeaks.length

  const dailyAverage = count > 0 ? totalSpent14Days / 14 : 0
  const monthlyProjection = dailyAverage * 30
  const annualProjection = dailyAverage * 365

  const categorySummary = validLeaks.reduce((acc, curr) => {
    const cat = curr.category || 'Outros'
    acc[cat] = (acc[cat] || 0) + Number(curr.amount || 0)
    return acc
  }, {})

  return {
    totalSpent14Days,
    dailyAverage,
    monthlyProjection,
    annualProjection,
    count,
    categorySummary,
  }
}

/**
 * Limpa prefixos de maquininhas de cartão brasileiras (PAG*, MP*, CIELO*, etc.)
 */
export const cleanMerchantTitle = (title = '') => {
  if (!title) return ''
  return title
    .replace(/^(pag\*|mp\s*\*|mp\*|cielo\*|rede\*|stone\*|ton\*|sumup\*|infinite\*|ifd\*|ubr\*|dl\*|pay\*)\s*/i, '')
    .trim()
}

/**
 * Auto-Categorizador Inteligente de Compras de Cartão de Crédito
 */
export const autoCategorizePurchase = (rawTitle = '', customRules = {}) => {
  const clean = cleanMerchantTitle(rawTitle).toLowerCase()
  const originalLower = rawTitle.toLowerCase()

  // 1. Verifica regras personalizadas ensinadas pelo usuário
  if (customRules && typeof customRules === 'object') {
    for (const [pattern, category] of Object.entries(customRules)) {
      const p = pattern.toLowerCase().trim()
      if (p && (clean.includes(p) || originalLower.includes(p))) {
        const isEssential =
          category.includes('Mercado') ||
          category.includes('Saúde') ||
          category.includes('Transporte') ||
          category.includes('Combustível') ||
          category.includes('Educação')
        return { category, isEssential, icon: 'Check', fromUserRule: true }
      }
    }
  }

  // 2. Base de Transporte & Combustível (Super expandida para o Brasil)
  if (
    clean.includes('3s') ||
    clean.includes('grupo 3s') ||
    clean.includes('posto') ||
    clean.includes('postos') ||
    clean.includes('auto posto') ||
    clean.includes('autoposto') ||
    clean.includes('combustivel') ||
    clean.includes('gasolina') ||
    clean.includes('etanol') ||
    clean.includes('gnv') ||
    clean.includes('ipiranga') ||
    clean.includes('shell') ||
    clean.includes('petrobras') ||
    clean.includes('br distribuidora') ||
    clean.includes('vibra') ||
    clean.includes('raizen') ||
    clean.includes('ale ') ||
    clean.includes('graal') ||
    clean.includes('frango assado') ||
    clean.includes('uber') ||
    clean.includes('99app') ||
    clean.includes('99*') ||
    clean.includes('99 tecnologia') ||
    clean.includes('sem parar') ||
    clean.includes('veloe') ||
    clean.includes('conectcar') ||
    clean.includes('estapar') ||
    clean.includes('estacionamento') ||
    clean.includes('zona azul') ||
    clean.includes('pedagio') ||
    clean.includes('ccr ') ||
    clean.includes('autocenter') ||
    clean.includes('pneus') ||
    clean.includes('troca de oleo')
  ) {
    return { category: 'Transporte & Combustível', isEssential: true, icon: 'Car' }
  }

  // 3. Alimentação Fora & Delivery
  if (
    clean.includes('ifood') ||
    clean.includes('rappi') ||
    clean.includes('restaurante') ||
    clean.includes('rest ') ||
    clean.includes('mcdonald') ||
    clean.includes('burger') ||
    clean.includes('pizza') ||
    clean.includes('pizzaria') ||
    clean.includes('bar ') ||
    clean.includes('boteco') ||
    clean.includes('churrasco') ||
    clean.includes('churrascaria') ||
    clean.includes('sushi') ||
    clean.includes('japones') ||
    clean.includes('padaria') ||
    clean.includes('panificadora') ||
    clean.includes('confeitaria') ||
    clean.includes('lanchonete') ||
    clean.includes('subway') ||
    clean.includes('habib') ||
    clean.includes('acai') ||
    clean.includes('sorvete') ||
    clean.includes('cafeteria') ||
    clean.includes('starbucks')
  ) {
    return { category: 'Alimentação Fora & Delivery', isEssential: false, icon: 'Utensils' }
  }

  // 4. Supermercado & Feira
  if (
    clean.includes('mercado') ||
    clean.includes('supermercado') ||
    clean.includes('superm') ||
    clean.includes('carrefour') ||
    clean.includes('extra') ||
    clean.includes('pao de acucar') ||
    clean.includes('atacad') ||
    clean.includes('assai') ||
    clean.includes('hortifruti') ||
    clean.includes('sacolao') ||
    clean.includes('acougue') ||
    clean.includes('mercearia') ||
    clean.includes('zaffari') ||
    clean.includes('guanabara') ||
    clean.includes('dia brasil') ||
    clean.includes('super muffato')
  ) {
    return { category: 'Mercado Essencial', isEssential: true, icon: 'ShoppingBag' }
  }

  // 5. Farmácia & Saúde
  if (
    clean.includes('droga') ||
    clean.includes('farmacia') ||
    clean.includes('raia') ||
    clean.includes('drogasil') ||
    clean.includes('panvel') ||
    clean.includes('pague menos') ||
    clean.includes('drogaria') ||
    clean.includes('hospital') ||
    clean.includes('laboratorio') ||
    clean.includes('clinica') ||
    clean.includes('consulta') ||
    clean.includes('odont') ||
    clean.includes('dentista') ||
    clean.includes('otica') ||
    clean.includes('oftalmo')
  ) {
    return { category: 'Farmácia & Saúde', isEssential: true, icon: 'Cross' }
  }

  // 6. Educação Essencial (Fixa e Inegociável)
  if (
    clean.includes('escola') ||
    clean.includes('colegio') ||
    clean.includes('colégio') ||
    clean.includes('faculdade') ||
    clean.includes('universidade') ||
    clean.includes('mensalidade') ||
    clean.includes('curso') ||
    clean.includes('cursos') ||
    clean.includes('creche') ||
    clean.includes('pos graduacao') ||
    clean.includes('pos-graduacao') ||
    clean.includes('pós-graduação') ||
    clean.includes('pós graduação') ||
    clean.includes('material escolar') ||
    clean.includes('livraria') ||
    clean.includes('idioma') ||
    clean.includes('idiomas') ||
    clean.includes('ingles') ||
    clean.includes('inglês') ||
    clean.includes('educacao') ||
    clean.includes('educação') ||
    clean.includes('alumni') ||
    clean.includes('estacio') ||
    clean.includes('estácio') ||
    clean.includes('anhanguera') ||
    clean.includes('unip') ||
    clean.includes('puc') ||
    clean.includes('fgv') ||
    clean.includes('kumon') ||
    clean.includes('cultura inglesa') ||
    clean.includes('cna') ||
    clean.includes('wizard') ||
    clean.includes('udemy') ||
    clean.includes('coursera') ||
    clean.includes('alura')
  ) {
    return { category: 'Educação Essencial', isEssential: true, icon: 'GraduationCap' }
  }

  // 6. Assinaturas & Serviços
  if (
    clean.includes('netflix') ||
    clean.includes('spotify') ||
    clean.includes('amazon prime') ||
    clean.includes('disney') ||
    clean.includes('hbo') ||
    clean.includes('max') ||
    clean.includes('apple.com') ||
    clean.includes('google') ||
    clean.includes('youtube') ||
    clean.includes('deezer') ||
    clean.includes('gympass') ||
    clean.includes('smartfit') ||
    clean.includes('bluefit') ||
    clean.includes('globo') ||
    clean.includes('crunchyroll') ||
    clean.includes('openai') ||
    clean.includes('chatgpt')
  ) {
    return { category: 'Assinaturas & Serviços', isEssential: false, icon: 'Tv' }
  }

  // 7. Roupas & Compras Online
  if (
    clean.includes('zara') ||
    clean.includes('renner') ||
    clean.includes('shein') ||
    clean.includes('shopee') ||
    clean.includes('riachuelo') ||
    clean.includes('c&a') ||
    clean.includes('mercado livre') ||
    clean.includes('amazon') ||
    clean.includes('magalu') ||
    clean.includes('magazine luiza') ||
    clean.includes('aliexpress') ||
    clean.includes('centauro') ||
    clean.includes('netshoes') ||
    clean.includes('dafiti') ||
    clean.includes('marisa') ||
    clean.includes('lojas americanas')
  ) {
    return { category: 'Compras & Vestuário', isEssential: false, icon: 'Tag' }
  }

  // 8. Lazer & Entretenimento
  if (
    clean.includes('cinema') ||
    clean.includes('cinemark') ||
    clean.includes('cinepolis') ||
    clean.includes('show') ||
    clean.includes('ingresso') ||
    clean.includes('steam') ||
    clean.includes('playstation') ||
    clean.includes('xbox') ||
    clean.includes('nintendo') ||
    clean.includes('teatro') ||
    clean.includes('parque')
  ) {
    return { category: 'Lazer & Entretenimento', isEssential: false, icon: 'Gamepad' }
  }

  return { category: 'Outros Gastos', isEssential: false, icon: 'CreditCard' }
}

/**
 * Detector de Titularidade (Meus Gastos vs Gastos de Outros / Compartilhado)
 */
export const detectPurchaseOwner = (rawText = '') => {
  const t = rawText.toLowerCase()
  if (
    t.includes('sogra') ||
    t.includes('dela') ||
    t.includes('dele') ||
    t.includes('outros') ||
    t.includes('outro') ||
    t.includes('outra') ||
    t.includes('terceiro') ||
    t.includes('terceiros') ||
    t.includes('amigo') ||
    t.includes('amiga') ||
    t.includes('parente') ||
    t.includes('familiar') ||
    t.includes('irmão') ||
    t.includes('irmao') ||
    t.includes('irmã') ||
    t.includes('irma') ||
    t.includes('filho') ||
    t.includes('filha') ||
    t.includes('esposa') ||
    t.includes('marido') ||
    t.includes('namorada') ||
    t.includes('namorado') ||
    t.includes('compartilhado') ||
    t.includes('reembolso') ||
    t.includes('(outros)') ||
    t.includes('[outros]') ||
    t.includes('(sogra)') ||
    t.includes('[sogra]')
  ) {
    return 'sogra'
  }
  return 'me'
}

/**
 * Parser de Linguagem Natural para Compras Rápidas
 * Ex: "Gastei 150 no cartão na farmácia, mas foi para um amigo"
 */
export const parseNaturalLanguagePurchase = (input = '', customRules = {}) => {
  if (!input || input.length < 3) return null

  // 1. Extração do valor em reais (ex: 150, R$ 150, 49,90, 80.50)
  const priceMatch = input.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2}|\d+,\d{2}|\d+)/i)
  if (!priceMatch) return null

  const rawAmountStr = priceMatch[1].replace('.', '').replace(',', '.')
  const amount = parseFloat(rawAmountStr)
  if (isNaN(amount) || amount <= 0) return null

  // 2. Detecção de titularidade (Outros vs Eu)
  const owner = detectPurchaseOwner(input)

  // 3. Extração da descrição e categoria
  let title = input
    .replace(priceMatch[0], '')
    .replace(/(gastei|comprei|paguei|no cartão|no cartao|cartão|cartao|de|em|para|foi|minha sogra|sogra|dela|dele|outros|outro|terceiros|amigo|amiga|mas)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!title || title.length < 2) {
    title = owner === 'sogra' ? 'Compra Compartilhada (Outros)' : 'Compra no Cartão'
  }

  const catInfo = autoCategorizePurchase(title || input, customRules)

  return {
    id: Date.now().toString() + Math.random().toString().slice(2, 6),
    title,
    amount,
    category: catInfo.category,
    isEssential: catInfo.isEssential,
    owner,
    date: new Date().toISOString(),
  }
}

/**
 * Parser Inteligente de Fatura de Cartão de Crédito
 */
export const parseInvoiceText = (rawText = '', customRules = {}, defaultOwner = 'me') => {
  const lines = rawText.split('\n')
  const results = []

  const priceRegex = /(?:R\$\s*|-?\s*)(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2}|\d+,\d{2})/i

  for (let line of lines) {
    line = line.trim()
    if (!line || line.length < 3) continue

    if (
      line.toLowerCase().includes('saldo') ||
      line.toLowerCase().includes('limite') ||
      line.toLowerCase().includes('pagamento recebido') ||
      line.toLowerCase().includes('fatura anterior')
    ) {
      continue
    }

    const lineOwner = detectPurchaseOwner(line) !== 'me' ? 'sogra' : defaultOwner

    if (line.includes(';') || (line.includes(',') && !line.includes('R$'))) {
      const parts = line.split(/[;,]/)
      if (parts.length >= 2) {
        const potentialAmountStr = parts[parts.length - 1].trim()
        const match = potentialAmountStr.match(priceRegex)
        if (match) {
          const rawAmount = match[1].replace('.', '').replace(',', '.')
          const amount = Math.abs(parseFloat(rawAmount))
          const title = parts.slice(0, parts.length - 1).join(' ').trim()
          if (amount > 0 && title) {
            const catInfo = autoCategorizePurchase(title, customRules)
            results.push({
              id: Date.now().toString() + Math.random().toString().slice(2, 6),
              title,
              amount,
              category: catInfo.category,
              isEssential: catInfo.isEssential,
              owner: lineOwner,
              date: new Date().toISOString(),
            })
            continue
          }
        }
      }
    }

    const match = line.match(priceRegex)
    if (match) {
      const fullMatch = match[0]
      const rawNum = match[1].replace('.', '').replace(',', '.')
      const amount = Math.abs(parseFloat(rawNum))

      let title = line.replace(fullMatch, '').trim()
      title = title.replace(/^\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?\s*/, '')
      title = title.replace(/^\d{1,2}\s+[A-Za-z]{3}\s*/, '')
      title = title.replace(/^[\-\*\•]\s*/, '').trim()

      if (amount > 0 && title.length > 1) {
        const catInfo = autoCategorizePurchase(title, customRules)
        results.push({
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          title,
          amount,
          category: catInfo.category,
          isEssential: catInfo.isEssential,
          owner: lineOwner,
          date: new Date().toISOString(),
        })
      }
    }
  }

  return results
}

/**
 * Análise de Especialista Financeiro sobre as Compras de Cartão
 * Com isolamento rigoroso dos Gastos da Sogra vs Fatura Pessoal Líquida
 */
export const analyzeCardPurchases = (purchases = [], declaredInvoiceTotal = 0) => {
  const grossTotal = purchases.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  // Separação por titularidade
  const myPurchases = purchases.filter((item) => (item.owner || 'me') === 'me')
  const sograPurchases = purchases.filter((item) => item.owner === 'sogra')

  const myNetTotal = myPurchases.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const sograTotal = sograPurchases.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  // Confronto e Conciliação com a Fatura Bruta Declarada
  const invoiceTotal = declaredInvoiceTotal > 0 ? declaredInvoiceTotal : grossTotal
  const reconciliationDiff = declaredInvoiceTotal > 0 ? declaredInvoiceTotal - grossTotal : 0
  const isReconciled = declaredInvoiceTotal > 0 ? Math.abs(reconciliationDiff) < 0.05 : true

  // Fatura pessoal líquida considerando a dedução da sogra
  const myReconciledNetTotal = Math.max(0, invoiceTotal - sograTotal)

  // Categorização apenas dos MEUS gastos (para não distorcer meu corte pessoal)
  const catMap = {}
  let myEssentialTotal = 0
  let mySuperfluousTotal = 0

  myPurchases.forEach((p) => {
    const cat = p.category || 'Outros Gastos'
    catMap[cat] = (catMap[cat] || 0) + Number(p.amount)
    if (p.isEssential) {
      myEssentialTotal += Number(p.amount)
    } else {
      mySuperfluousTotal += Number(p.amount)
    }
  })

  const categories = Object.keys(catMap).map((name) => ({
    name,
    amount: catMap[name],
    percentage: myNetTotal > 0 ? (catMap[name] / myNetTotal) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount)

  const topMyExpenses = [...myPurchases].sort((a, b) => b.amount - a.amount).slice(0, 5)

  const potentialSavings30 = mySuperfluousTotal * 0.3
  const potentialSavings50 = mySuperfluousTotal * 0.5

  let verdict = ''
  const mySuperfluousPercent = myNetTotal > 0 ? (mySuperfluousTotal / myNetTotal) * 100 : 0

  if (sograTotal > 0) {
    verdict = `Cartão Compartilhado Ativo: A fatura bruta totalizou ${formatBRL(invoiceTotal)}. Descontando os gastos de outras pessoas (${formatBRL(sograTotal)}), a sua responsabilidade líquida é de ${formatBRL(myReconciledNetTotal)}.`
  } else if (mySuperfluousPercent > 50) {
    verdict = `Alerta de Risco: Mais de ${mySuperfluousPercent.toFixed(0)}% da sua fatura líquida foi em supérfluos e delivery. Foco em reduzir compras pessoais.`
  } else {
    verdict = `Fatura pessoal equilibrada. A maior parte dos seus gastos pessoais está protegida em categorias essenciais.`
  }

  return {
    total: grossTotal,
    grossTotal,
    sograTotal,
    myNetTotal,
    myReconciledNetTotal,
    sograCount: sograPurchases.length,
    myCount: myPurchases.length,
    sograPurchases,
    myPurchases,
    invoiceTotal,
    declaredInvoiceTotal,
    reconciliationDiff,
    isReconciled,
    // Métricas Pessoais
    essentialTotal: myEssentialTotal,
    superfluousTotal: mySuperfluousTotal,
    superfluousPercent: mySuperfluousPercent,
    categories,
    topExpenses: topMyExpenses,
    potentialSavings30,
    potentialSavings50,
    verdict,
  }
}

/**
 * Gera mensagem formatada para envio via WhatsApp para Acerto de Compras de Outros
 */
export const generateSograWhatsAppMessage = (sograPurchases = [], sograTotal = 0) => {
  let msg = `Olá! Segue o extrato detalhado das compras compartilhadas no cartão para acerto/reembolso deste mês:\n\n`
  sograPurchases.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.title}: ${formatBRL(item.amount)}\n`
  })
  msg += `\n-------------------------\n`
  msg += `*Total a transferir/reembolsar: ${formatBRL(sograTotal)}*\n`
  msg += `(Valores já deduzidos da fatura principal)`
  return msg
}

/**
 * Dados padrão para teste/exemplo do usuário
 */
export const DEFAULT_FINANCE_DATA = {
  profile: {
    monthlyIncome: 3000,
    incomeSources: [
      { id: '1', title: 'Salário Fixo', amount: 3000 },
    ],
  },
  fixedExpenses: [
    { id: '1', name: 'Aluguel + Moradia', amount: 1100, isEssential: true },
    { id: '2', name: 'Mercado Básico', amount: 650, isEssential: true },
    { id: '3', name: 'Luz + Água', amount: 200, isEssential: true },
    { id: '4', name: 'Internet', amount: 100, isEssential: true },
  ],
  debts: [
    {
      id: '1',
      name: 'Cartão de Crédito (Rotativo)',
      category: 'cartao',
      balance: 2400,
      minPayment: 350,
      interestRate: 14.2,
      isEssential: false,
    },
    {
      id: '2',
      name: 'Empréstimo Pessoal',
      category: 'pessoal',
      balance: 3000,
      minPayment: 260,
      interestRate: 4.8,
      isEssential: false,
    },
  ],
  leaks: [
    { id: '1', name: 'iFood janta', category: 'Delivery', amount: 45.0, date: new Date().toISOString() },
    { id: '2', name: 'Uber trabalho', category: 'Transporte', amount: 22.0, date: new Date().toISOString() },
    { id: '3', name: 'Lanche padaria', category: 'Lanches', amount: 16.5, date: new Date().toISOString() },
  ],
  cardPurchases: [
    { id: '1', title: 'Posto Grupo 3S Gasolina', amount: 180.0, category: 'Transporte & Combustível', isEssential: true, owner: 'me', date: new Date().toISOString() },
    { id: '2', title: 'iFood Burguer & Batata', amount: 64.9, category: 'Alimentação Fora & Delivery', isEssential: false, owner: 'me', date: new Date().toISOString() },
    { id: '3', title: 'Droga Raia Remédios (Outros)', amount: 150.0, category: 'Farmácia & Saúde', isEssential: true, owner: 'sogra', date: new Date().toISOString() },
    { id: '4', title: 'Supermercado Extra (Outros)', amount: 220.0, category: 'Mercado Essencial', isEssential: true, owner: 'sogra', date: new Date().toISOString() },
    { id: '5', title: 'Netflix Assinatura', amount: 44.9, category: 'Assinaturas & Serviços', isEssential: false, owner: 'me', date: new Date().toISOString() },
  ],
  declaredInvoiceTotal: 659.8,
  customRules: {
    'grupo 3s': 'Transporte & Combustível',
    '3s': 'Transporte & Combustível',
  },
  strategy: 'avalanche',
  extraMonthlyPayment: 150,
}
