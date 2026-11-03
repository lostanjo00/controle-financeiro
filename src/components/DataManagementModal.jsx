import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { Download, Upload, Trash2, RefreshCw, X, CheckCircle2, AlertTriangle } from 'lucide-react'

export const DataManagementModal = ({ isOpen, onClose }) => {
  const { data, loadDemoData, clearAllData, importData } = useFinance()
  const [importText, setImportText] = useState('')
  const [feedback, setFeedback] = useState(null)

  if (!isOpen) return null

  const handleExport = () => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup_financas_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setFeedback({ type: 'success', message: 'Backup baixado com sucesso!' })
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText)
      const success = importData(parsed)
      if (success) {
        setFeedback({ type: 'success', message: 'Dados restaurados com sucesso!' })
        setTimeout(() => {
          onClose()
          setFeedback(null)
          setImportText('')
        }, 1200)
      } else {
        setFeedback({ type: 'error', message: 'Arquivo JSON em formato incompatível.' })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Texto JSON inválido. Verifique o conteúdo colado.' })
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        const success = importData(parsed)
        if (success) {
          setFeedback({ type: 'success', message: 'Arquivo importado com sucesso!' })
          setTimeout(() => {
            onClose()
            setFeedback(null)
          }, 1200)
        } else {
          setFeedback({ type: 'error', message: 'Conteúdo do arquivo não corresponde aos dados do app.' })
        }
      } catch {
        setFeedback({ type: 'error', message: 'Erro ao ler o arquivo JSON selecionado.' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span>Configurações & Backup de Dados</span>
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Seus dados ficam 100% salvos no seu navegador local com total privacidade. Exporte para usar no celular ou PC.
        </p>

        {feedback && (
          <div
            className={`p-3 rounded-xl mb-4 text-sm flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            {feedback.message}
          </div>
        )}

        <div className="space-y-4">
          {/* Exportar Backup */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white text-sm">Exportar Backup (Download)</h4>
              <p className="text-xs text-slate-400">Gera um arquivo .json para guardar ou passar para o celular</p>
            </div>
            <button
              onClick={handleExport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950"
            >
              <Download size={15} /> Baixar
            </button>
          </div>

          {/* Importar Arquivo */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white text-sm">Importar Arquivo JSON</h4>
              <p className="text-xs text-slate-400">Restaura um backup gerado anteriormente</p>
            </div>
            <label className="cursor-pointer px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-950">
              <Upload size={15} /> Selecionar
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Colar JSON Direto */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h4 className="font-semibold text-white text-sm mb-1">Ou cole o texto do backup:</h4>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Cole o código JSON do seu backup aqui..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono mb-2"
            />
            <button
              disabled={!importText.trim()}
              onClick={handleImport}
              className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs rounded-lg font-medium transition"
            >
              Carregar Dados Colados
            </button>
          </div>

          {/* Ações Rápidas */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => {
                if (window.confirm('Carregar os dados simulados de exemplo?')) {
                  loadDemoData()
                  setFeedback({ type: 'success', message: 'Exemplo carregado!' })
                }
              }}
              className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw size={14} /> Carregar Exemplo
            </button>
            <button
              onClick={() => {
                if (window.confirm('Atenção: deseja realmente limpar todos os seus dados e começar do zero?')) {
                  clearAllData()
                  setFeedback({ type: 'success', message: 'Dados zerados com sucesso.' })
                }
              }}
              className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded-xl font-medium border border-rose-500/20 flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 size={14} /> Limpar Tudo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
