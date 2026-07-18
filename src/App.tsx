import { useState, useEffect } from 'react'
import Onboarding from './screens/Onboarding'
import CreateMarket from './screens/CreateMarket'
import MarketView from './screens/MarketView'
import { useSession } from './core/auth'

export default function App() {
  const session = useSession()
  const [marketId, setMarketId] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get('market')
  })

  useEffect(() => {
    const handlePopState = () => {
      setMarketId(new URLSearchParams(window.location.search).get('market'))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (!session) {
    return <Onboarding onComplete={() => {}} />
  }

  if (marketId) {
    return <MarketView marketId={marketId} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="text-lg font-semibold tracking-tight">Stakes</div>
        <div className="text-sm text-slate-400">Logged in as <span className="text-white font-medium">{session.name}</span></div>
      </header>
      <CreateMarket
        creatorId={session.id}
        creatorName={session.name}
        onCreated={(id) => {
          window.history.pushState({}, '', `?market=${id}`)
          setMarketId(id)
        }} 
      />
    </div>
  )
}
