import { describe, it, expect } from 'vitest'
import { computePools, settle } from './settle'
import type { Market } from './types'

const base: Market = {
  id: 'm1', creatorId: 'u1', goal: 'Ship 5 PRs', creatorStake: 50,
  deadlineIso: '2026-07-20T00:00:00Z', causeId: 'c1', status: 'open',
  stakes: [
    { userId: 'a', side: 'back', amount: 30 },
    { userId: 'b', side: 'back', amount: 10 },
    { userId: 'c', side: 'fade', amount: 20 },
  ],
}
const sum = (ps: { amount: number }[]) => ps.reduce((s, p) => s + p.amount, 0)

describe('computePools', () => {
  it('splits escrow/support/doubt', () => {
    expect(computePools(base)).toEqual({ escrow: 50, support: 40, doubt: 20 })
  })
})

describe('settle', () => {
  it('conserves funds on success', () => {
    const ps = settle(base, true)
    expect(sum(ps)).toBe(110)
  })
  it('success: creator gets escrow back, backers split doubt pro-rata + own stake', () => {
    const ps = settle(base, true)
    expect(ps.find(p => p.kind === 'creator')!.amount).toBe(50)
    const a = ps.find(p => p.toUserId === 'a')!
    const b = ps.find(p => p.toUserId === 'b')!
    expect(a.amount).toBeCloseTo(45)
    expect(b.amount).toBeCloseTo(15)
    expect(ps.some(p => p.toUserId === 'c')).toBe(false)
  })
  it('conserves funds on failure', () => {
    const ps = settle(base, false)
    expect(sum(ps)).toBe(110)
  })
  it('failure: faders win escrow+support, no cause payout', () => {
    const ps = settle(base, false)
    expect(ps.some(p => p.kind === 'cause')).toBe(false)
    expect(ps.find(p => p.toUserId === 'c')!.amount).toBe(110) // 20 stake + 90 pool
  })
  it('conserves funds on success even with faders but zero backers', () => {
    const noBackers: Market = {
      ...base,
      stakes: [{ userId: 'c', side: 'fade', amount: 20 }],
    }
    const ps = settle(noBackers, true)
    // escrow 50 + doubt 20 = 70 must all be accounted for
    expect(sum(ps)).toBe(70)
  })
})
