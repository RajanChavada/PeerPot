import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Pot from '../three/Pot'
import StakePanel from '../components/StakePanel'
import BackerList from '../components/BackerList'
import ReceiptFeed from '../components/ReceiptFeed'
import { useStakesMachine } from '../hooks/useStakesMachine'
import { useSession } from '../core/auth'
import { deadlinePressure } from '../core/pressure'
import { flags } from '../core/config'
import ShareBar from '../components/ShareBar'

const NOW = Date.parse('2026-07-18T00:00:00Z')

export default function MarketView({ marketId }: { marketId: string }) {
  const m = useStakesMachine(marketId)
  const session = useSession()
  const [evidence, setEvidence] = useState('merged 5 PRs to the repo')

  if (!m.market) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading market...
      </div>
    )
  }

  const potValue = m.pools.escrow + m.pools.support + m.pools.doubt
  const pressure = deadlinePressure(m.market.deadlineIso, NOW)
  const burst = m.phase === 'done' ? (m.success ? 'success' : 'failure') : null
  const anyLive = Object.values(flags).some(Boolean)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="text-lg font-semibold tracking-tight">Stakes</div>
        <div className={`rounded-full px-3 py-1 text-xs font-medium ${anyLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
          {anyLive ? 'LIVE integrations' : 'DEMO — all mocked'}
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-8 md:grid-cols-2">
        <section className="flex flex-col items-center gap-4">
          <div className="text-center">
            <div className="text-sm text-slate-400">The goal</div>
            <h1 className="text-xl font-semibold">{m.market.goal}</h1>
          </div>
          <Pot potValue={potValue} deadlinePressure={pressure} burst={burst} />
          <div className="flex gap-6 text-center text-sm">
            <div><div className="text-slate-400">Escrow</div><div className="font-semibold">${m.pools.escrow}</div></div>
            <div><div className="text-emerald-400">Backing</div><div className="font-semibold">${m.pools.support}</div></div>
            <div><div className="text-rose-400">Doubt</div><div className="font-semibold">${m.pools.doubt}</div></div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <ShareBar marketId={marketId} />

          <StakePanel onBack={m.back} onFade={m.fade} disabled={m.phase !== 'open'} />

          <AnimatePresence>
            {m.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-sm text-amber-300"
              >
                ⚠️ {m.error}
              </motion.div>
            )}
          </AnimatePresence>

          <BackerList
            stakes={m.market.stakes}
            currentUserId={session?.id}
            creatorId={m.market.creatorId}
          />

          {m.phase !== 'done' && (
            <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
              <label className="text-sm text-slate-400" htmlFor="evidence">Deadline evidence</label>
              <textarea
                id="evidence"
                className="rounded-md bg-slate-800 px-3 py-2 text-sm"
                rows={2}
                value={evidence}
                onChange={e => setEvidence(e.target.value)}
              />
              <button
                className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                disabled={m.phase === 'settling'}
                onClick={() => m.runSettlement(evidence)}
              >
                {m.phase === 'settling' ? 'Settling…' : 'Settle the pot'}
              </button>
            </div>
          )}

          <AnimatePresence>
            {m.phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <div className={`rounded-xl px-4 py-3 text-center text-lg font-semibold ${m.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {m.success ? 'Goal met — backers win' : 'Goal missed — faders win'}
                </div>
                <ReceiptFeed receipts={m.receipts} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  )
}
