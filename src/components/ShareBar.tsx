import { useState } from 'react'
import { flags } from '../core/config'

// Host/join affordance: the market URL already carries ?market=<id>, so
// sharing this link IS the invite — friends open it and land straight in the
// market. The badge tells you whether stakes sync across devices (Supabase) or
// only within this browser (localStorage mock).
export default function ShareBar({ marketId }: { marketId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}${window.location.pathname}?market=${marketId}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked (e.g. insecure context) — leave the field for manual copy
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
          Invite backers
        </span>
        <span
          className={
            flags.supabase
              ? 'rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300'
              : 'rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-white/50'
          }
          title={
            flags.supabase
              ? 'Stakes sync across devices via Supabase'
              : 'Mock mode: stakes stay in this browser. Add VITE_SUPABASE_* to sync across devices.'
          }
        >
          {flags.supabase ? '● live sync' : '○ local only'}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={e => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-md bg-black/30 px-2 py-1.5 text-xs text-white/80"
        />
        <button
          onClick={copy}
          className="shrink-0 rounded-md bg-sky-500/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  )
}
