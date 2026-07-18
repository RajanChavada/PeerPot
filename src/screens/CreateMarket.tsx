import { useState } from 'react'
import { saveMarket } from '../core/db'
import type { Market } from '../core/types'

export default function CreateMarket({
  creatorId,
  creatorName,
  onCreated
}: {
  creatorId: string
  creatorName: string
  onCreated: (marketId: string) => void
}) {
  const [goal, setGoal] = useState('')
  const [escrow, setEscrow] = useState(50)
  const [deadline, setDeadline] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim() || !deadline) return

    const marketId = 'm_' + Math.random().toString(36).substring(2, 9)
    
    // Ensure deadline is stored as a valid ISO string
    const deadlineIso = new Date(deadline).toISOString()

    const newMarket: Market = {
      id: marketId,
      creatorId,
      creatorName,
      goal: goal.trim(),
      creatorStake: escrow,
      deadlineIso,
      causeId: 'cause_demo', // hardcoded cause for now
      status: 'open',
      stakes: [],
      visibility: 'public',
    }

    saveMarket(newMarket)
    onCreated(marketId)
  }

  // Set default deadline to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDateStr = tomorrow.toISOString().slice(0, 16) // YYYY-MM-DDThh:mm

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold">Host a Commitment</h2>
        <p className="mb-6 text-sm text-slate-400">Put your money where your mouth is.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">What's your goal?</label>
            <textarea
              required
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Run a 5k under 25 minutes"
              rows={3}
              value={goal}
              onChange={e => setGoal(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Deadline</label>
            <input
              type="datetime-local"
              required
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={deadline || defaultDateStr}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Your Escrow Stake ($)</label>
            <input
              type="number"
              min={5}
              required
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={escrow}
              onChange={e => setEscrow(Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-slate-500">You lose this if you fail the goal.</p>
          </div>

          <button
            type="submit"
            disabled={!goal.trim()}
            className="mt-4 w-full rounded-md bg-indigo-500 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            Create Market
          </button>
        </form>
      </div>
    </div>
  )
}
