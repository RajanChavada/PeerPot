import { useState } from 'react'
import { signIn } from '../core/auth'

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    signIn(name.trim())
    onComplete()
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold">Welcome to Stakes</h2>
        <p className="mb-6 text-sm text-slate-400">Enter a screen name to join the market.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Screen Name</label>
            <input
              type="text"
              autoFocus
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Satoshi"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-2 w-full rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            Enter App
          </button>
        </form>
      </div>
    </div>
  )
}
