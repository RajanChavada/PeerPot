import type { Stake } from '../core/types'

export default function BackerList({
  stakes,
  currentUserId,
  creatorId,
}: {
  stakes: Stake[]
  currentUserId?: string
  creatorId?: string
}) {
  return (
    <div className="flex flex-col gap-1" aria-label="Backers">
      {stakes.map((s, i) => {
        const label = s.name || s.userId
        const isYou = s.userId === currentUserId
        const isHost = s.userId === creatorId
        return (
          <div key={i} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-1.5 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="font-medium">{label}</span>
              {isYou && (
                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-300">
                  you
                </span>
              )}
              {isHost && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-300">
                  host
                </span>
              )}
            </span>
            <span className={s.side === 'back' ? 'text-emerald-400' : 'text-rose-400'}>
              {s.side === 'back' ? '▲ backs' : '▼ fades'} ${s.amount}
            </span>
          </div>
        )
      })}
    </div>
  )
}
