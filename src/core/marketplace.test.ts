import { it, expect, beforeEach, vi } from 'vitest'
import type { Market } from './types'

const market = (id: string, creatorId: string, visibility: 'public' | 'friends' = 'public'): Market => ({
  id, creatorId, goal: 'g', creatorStake: 1, deadlineIso: '2026-07-19T00:00:00.000Z',
  causeId: 'c', stakes: [], status: 'open', visibility,
})

const MARKETS: Market[] = [
  market('m1', 'me'),
  market('m2', 'friendA'),
  market('m3', 'stranger'),
  market('m4', 'friendB', 'friends'),
]

vi.mock('./db', () => ({ getMarkets: () => MARKETS }))
vi.mock('./users', () => ({
  getFriends: (id: string) =>
    id === 'me' ? [{ id: 'friendA' }, { id: 'friendB' }] : [],
}))

beforeEach(() => localStorage.clear())

it('listMine returns only my markets', async () => {
  const { listMine } = await import('./marketplace')
  expect(listMine('me').map(m => m.id)).toEqual(['m1'])
})

it('listFriends returns markets created by my friends', async () => {
  const { listFriends } = await import('./marketplace')
  expect(listFriends('me').map(m => m.id).sort()).toEqual(['m2', 'm4'])
})

it('listGlobal returns only public markets', async () => {
  const { listGlobal } = await import('./marketplace')
  expect(listGlobal().map(m => m.id).sort()).toEqual(['m1', 'm2', 'm3'])
})

it('scopedMarkets dispatches by scope', async () => {
  const { scopedMarkets } = await import('./marketplace')
  expect(scopedMarkets('me', 'mine').map(m => m.id)).toEqual(['m1'])
  expect(scopedMarkets('me', 'global').map(m => m.id).sort()).toEqual(['m1', 'm2', 'm3'])
})
