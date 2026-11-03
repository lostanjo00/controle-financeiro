import React, { useState } from 'react'
import { FinanceProvider } from './context/FinanceContext'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { RaioXTab } from './components/RaioXTab'
import { DividasTab } from './components/DividasTab'
import { CartaoTab } from './components/CartaoTab'
import { RalosTab } from './components/RalosTab'
import { LinhaDoTempoTab } from './components/LinhaDoTempoTab'
import { ConsultorTab } from './components/ConsultorTab'

function FinanceApp() {
  const [activeTab, setActiveTab] = useState('raio-x')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Conteúdo Principal com padding inferior para a barra mobile */}
      <main className="flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'raio-x' && <RaioXTab setActiveTab={setActiveTab} />}
        {activeTab === 'dividas' && <DividasTab />}
        {activeTab === 'cartao' && <CartaoTab />}
        {activeTab === 'ralos' && <RalosTab />}
        {activeTab === 'timeline' && <LinhaDoTempoTab />}
        {activeTab === 'consultor' && <ConsultorTab />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <FinanceProvider>
      <FinanceApp />
    </FinanceProvider>
  )
}
