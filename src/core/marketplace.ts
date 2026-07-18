import type { Market } from './types'
import { getMarkets } from './db'
import { getFriends } from './users'

export type MarketScope = 'mine' | 'friends' | 'global'

export function listMine(userId: string): Market[] {
  return getMarkets().filter(m => m.creatorId === userId)
}

export function listFriends(userId: string): Market[] {
  const friendIds = new Set(getFriends(userId).map(f => f.id))
  return getMarkets().filter(m => friendIds.has(m.creatorId))
}

export function listGlobal(): Market[] {
  return getMarkets().filter(m => m.visibility === 'public')
}

export function scopedMarkets(userId: string, scope: MarketScope): Market[] {
  if (scope === 'mine') return listMine(userId)
  if (scope === 'friends') return listFriends(userId)
  return listGlobal()
}
