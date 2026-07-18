import { describe, it, expect } from 'vitest'
import { MarketSchema, UserProfileSchema } from './types'

describe('MarketSchema', () => {
  it('parses a valid open market', () => {
    const m = MarketSchema.parse({
      id: 'm1', creatorId: 'u1', goal: 'Ship 5 PRs', creatorStake: 50,
      deadlineIso: '2026-07-20T00:00:00Z', causeId: 'c1', stakes: [], status: 'open',
    })
    expect(m.goal).toBe('Ship 5 PRs')
  })
  it('rejects negative stake amounts', () => {
    expect(() => MarketSchema.parse({
      id: 'm1', creatorId: 'u1', goal: 'x', creatorStake: -1,
      deadlineIso: '2026-07-20T00:00:00Z', causeId: 'c1', stakes: [], status: 'open',
    })).toThrow()
  })
  it('defaults visibility to public when absent', () => {
    const m = MarketSchema.parse({
      id: 'm1', creatorId: 'u1', goal: 'ship it', creatorStake: 10,
      deadlineIso: '2026-07-19T00:00:00.000Z', causeId: 'cause_demo', stakes: [], status: 'open',
    })
    expect(m.visibility).toBe('public')
  })
})

describe('UserProfileSchema', () => {
  it('parses a user profile with friends and friend code', () => {
    const p = UserProfileSchema.parse({
      id: 'user_abc', name: 'Ada', friendCode: 'x1y2z3', friends: ['user_def'],
    })
    expect(p.friends).toEqual(['user_def'])
    expect(p.avatarBase64).toBeUndefined()
  })
  it('defaults friends to empty array', () => {
    const p = UserProfileSchema.parse({ id: 'u', name: 'N', friendCode: 'c' })
    expect(p.friends).toEqual([])
  })
})
