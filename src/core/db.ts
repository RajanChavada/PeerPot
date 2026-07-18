import { useState, useEffect } from 'react'
import type { Market } from './types'
import { loadMarkets } from './store'

const DB_KEY = 'stakes_markets'

// Initialize the DB with the seed markets if it doesn't exist
function initDb() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(loadMarkets()))
  }
}

// Get all markets from the DB
export function getMarkets(): Market[] {
  initDb()
  const data = localStorage.getItem(DB_KEY)
  return data ? JSON.parse(data) : []
}

// Get a single market by ID
export function getMarket(id: string): Market | undefined {
  return getMarkets().find(m => m.id === id)
}

// Save or update a market in the DB
export function saveMarket(market: Market) {
  const markets = getMarkets()
  const index = markets.findIndex(m => m.id === market.id)
  
  if (index !== -1) {
    markets[index] = market
  } else {
    markets.push(market)
  }
  
  localStorage.setItem(DB_KEY, JSON.stringify(markets))
  // Dispatch a custom event for same-tab updates, since 'storage' events only fire across tabs
  window.dispatchEvent(new Event('stakes_db_changed'))
}

// React Hook to subscribe to a specific market's real-time updates
export function useLiveMarket(marketId: string | undefined): Market | undefined {
  const [market, setMarket] = useState<Market | undefined>(() => 
    marketId ? getMarket(marketId) : undefined
  )

  useEffect(() => {
    if (!marketId) return

    function handleUpdate() {
      setMarket(getMarket(marketId))
    }

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('stakes_db_changed', handleUpdate)
    
    // Initial fetch in case it changed before the effect ran
    handleUpdate()

    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('stakes_db_changed', handleUpdate)
    }
  }, [marketId])

  return market
}
