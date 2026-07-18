import type { Market } from './types'

export interface Pools { escrow: number; support: number; doubt: number }
export interface Payout { toUserId: string | null; amount: number; kind: 'creator' | 'backer' | 'cause' }

export function computePools(market: Market): Pools {
  const support = market.stakes.filter(s => s.side === 'back').reduce((s, x) => s + x.amount, 0)
  const doubt = market.stakes.filter(s => s.side === 'fade').reduce((s, x) => s + x.amount, 0)
  return { escrow: market.creatorStake, support, doubt }
}

export function settle(market: Market, success: boolean): Payout[] {
  const { escrow, support, doubt } = computePools(market)
  const backers = market.stakes.filter(s => s.side === 'back')
  const faders = market.stakes.filter(s => s.side === 'fade')

  if (success) {
    // No backers to split the doubt pool → the creator wins it (they beat the doubters).
    const creatorAmount = backers.length === 0 ? escrow + doubt : escrow
    const payouts: Payout[] = [{ toUserId: market.creatorId, amount: creatorAmount, kind: 'creator' }]
    for (const b of backers) {
      const share = support > 0 ? (b.amount / support) * doubt : 0
      payouts.push({ toUserId: b.userId, amount: b.amount + share, kind: 'backer' })
    }
    return payouts
  }
  // Failure: Faders win the escrow + support pool.
  if (faders.length === 0) {
    // No faders? The cause gets the money.
    return [{ toUserId: null, amount: escrow + support, kind: 'cause' }]
  }

  const payouts: Payout[] = []
  for (const f of faders) {
    const share = doubt > 0 ? (f.amount / doubt) * (escrow + support) : 0
    payouts.push({ toUserId: f.userId, amount: f.amount + share, kind: 'backer' })
  }
  return payouts
}
