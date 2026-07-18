import { useState } from 'react'
import { useSession } from '../core/auth'

export default function StakePanel({ onBack, onFade, disabled }: {
  onBack: (userId: string, name: string, amount: number) => void
  onFade: (userId: string, name: string, amount: number) => void
  disabled?: boolean
}) {
  const session = useSession()
  const [amount, setAmount] = useState(10)

  // Wait for session to load
  if (!session) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-400">Stake as {session.name}</div>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full rounded-md bg-slate-800 px-2 py-1 text-sm"
          aria-label="Amount"
        />
      </div>
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-md bg-emerald-500/90 px-3 py-2 text-sm font-medium text-emerald-950 disabled:opacity-40"
          onClick={() => onBack(session.id, session.name, amount)}
          disabled={disabled || amount < 1}
        >
          Back them ▲
        </button>
        <button
          className="flex-1 rounded-md bg-rose-500/90 px-3 py-2 text-sm font-medium text-rose-950 disabled:opacity-40"
          onClick={() => onFade(session.id, session.name, amount)}
          disabled={disabled || amount < 1}
        >
          Fade them ▼
        </button>
      </div>
    </div>
  )
}
