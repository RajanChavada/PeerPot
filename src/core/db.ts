import { useState, useEffect } from 'react'
import type { Market } from './types'
import { loadMarkets } from './store'
import {
  enabled as remoteEnabled,
  fetchMarketRemote,
  upsertMarketRemote,
} from './supabase'

const DB_KEY = 'stakes_markets'
const POLL_MS = 2500

// localStorage acts as the source of truth locally AND as a cache of the
// remote store. When Supabase is enabled we treat it as authoritative and
// mirror it into localStorage so the UI stays synchronous.

function initDb() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(loadMarkets()))
  }
}

export function getMarkets(): Market[] {
  initDb()
  const data = localStorage.getItem(DB_KEY)
  return data ? JSON.parse(data) : []
}

export function getMarket(id: string): Market | undefined {
  return getMarkets().find(m => m.id === id)
}

function writeLocal(market: Market) {
  const markets = getMarkets()
  const index = markets.findIndex(m => m.id === market.id)
  if (index !== -1) markets[index] = market
  else markets.push(market)
  localStorage.setItem(DB_KEY, JSON.stringify(markets))
  window.dispatchEvent(new Event('stakes_db_changed'))
}

// Save or update a market. Writes locally immediately (optimistic) and, when
// Supabase is configured, pushes to the remote store so other devices see it.
export function saveMarket(market: Market) {
  writeLocal(market)
  if (remoteEnabled) {
    upsertMarketRemote(market).catch(err =>
      console.error('Remote upsert failed (kept local copy):', err),
    )
  }
}

// React hook: subscribe to a single market's updates. Same-tab and cross-tab
// updates come through storage events; cross-device updates come through
// polling the remote store (only active when Supabase is enabled).
export function useLiveMarket(marketId: string | undefined): Market | undefined {
  const [market, setMarket] = useState<Market | undefined>(() =>
    marketId ? getMarket(marketId) : undefined,
  )

  useEffect(() => {
    if (!marketId) return
    let cancelled = false

    function handleUpdate() {
      if (marketId) setMarket(getMarket(marketId))
    }

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('stakes_db_changed', handleUpdate)
    handleUpdate()

    let timer: ReturnType<typeof setInterval> | undefined
    if (remoteEnabled) {
      const poll = async () => {
        try {
          const remote = await fetchMarketRemote(marketId)
          if (!cancelled && remote) writeLocal(remote)
        } catch (err) {
          console.error('Remote poll failed:', err)
        }
      }
      poll()
      timer = setInterval(poll, POLL_MS)
    }

    return () => {
      cancelled = true
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('stakes_db_changed', handleUpdate)
      if (timer) clearInterval(timer)
    }
  }, [marketId])

  return market
}
