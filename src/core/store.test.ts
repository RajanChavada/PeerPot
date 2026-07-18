import { describe, it, expect } from 'vitest'
import { loadMarkets, addStake, seedDemoMarket } from './store'

describe('store', () => {
  it('loads and validates fixtures', () => {
    expect(loadMarkets().length).toBeGreaterThan(0)
  })
  it('addStake appends immutably', () => {
    const m = seedDemoMarket()
    const before = m.stakes.length
    const next = addStake(m, { userId: 'z', side: 'fade', amount: 5 })
    expect(next.stakes.length).toBe(before + 1)
    expect(m.stakes.length).toBe(before)
  })
  it('rejects stakes on settled markets', () => {
    const m = { ...seedDemoMarket(), status: 'settled_success' as const }
    expect(() => addStake(m, { userId: 'z', side: 'back', amount: 5 })).toThrow()
  })
})
