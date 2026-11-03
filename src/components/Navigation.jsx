import React from 'react'
import { LayoutDashboard, CreditCard, Flame, CalendarClock, Bot, Receipt } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'

export const Navigation = ({ activeTab, setActiveTab }) => {
  const { priorityCounts, leakStats, data } = useFinance()

  const tabs = [
    {
      id: 'raio-x',
      label: 'Raio-X',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'dividas',
      label: 'Matriz Dívidas',
      icon: CreditCard,
      badge: priorityCounts.p1 > 0 ? `${priorityCounts.p1} Urgente` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'cartao',
      label: 'Fatura Cartão',
      icon: Receipt,
      badge: (data.cardPurchases?.length > 0) ? `${data.cardPurchases.length}` : 'IA',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'ralos',
      label: 'Ralos 14 Dias',
      icon: Flame,
      badge: leakStats.count > 0 ? `${leakStats.count}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'timeline',
      label: 'Linha do Tempo',
      icon: CalendarClock,
      badge: null,
    },
    {
      id: 'consultor',
      label: 'Consultor',
      icon: Bot,
      badge: 'IA',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
  ]

  return (
    <>
      {/* Desktop Navigation (Top Bar) */}
      <nav className="hidden md:block border-b border-slate-800 bg-slate-900/30 px-4">
        <div className="max-w-7xl mx-auto flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 font-medium text-xs sm:text-sm border-b-2 transition relative ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider ${
                      tab.badgeColor || 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Mobile Navigation (Bottom Bar - estilo app nativo) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-1 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 relative transition rounded-xl ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 text-[8px] bg-indigo-500 text-white font-bold rounded-full h-3.5 min-w-3.5 px-0.5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-medium tracking-tight mt-1">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
