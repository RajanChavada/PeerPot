import { MarketSchema, type Market, type Stake, type Cause } from './types'
import marketsJson from '../fixtures/markets.json'
import causesJson from '../fixtures/causes.json'

export function loadMarkets(): Market[] {
  return MarketSchema.array().parse(marketsJson)
}

export function loadCauses(): Cause[] {
  return causesJson as Cause[]
}

export function seedDemoMarket(): Market {
  return loadMarkets()[0]
}

export function addStake(market: Market, stake: Stake): Market {
  if (market.status !== 'open') throw new Error('market is not open for staking')
  return { ...market, stakes: [...market.stakes, stake] }
}
