import { useMemo, useState } from 'react'
import { useLiveMarket, saveMarket } from '../core/db'
import { computePools, settle } from '../core/settle'
import { describeReceipt } from '../core/receipts'
import { flags } from '../core/config'
import { makeUnifold } from '../adapters/unifold'
import { makeSolana } from '../adapters/solana'
import { makeVerifier } from '../adapters/verify'
import type { Market, StakeSide } from '../core/types'

export type Phase = 'open' | 'settling' | 'done'

export function useStakesMachine(marketId?: string) {
  // If no marketId is provided, we default to the demo market "m-demo" for test compatibility
  const activeId = marketId || 'm-demo'
  const market = useLiveMarket(activeId)

  const [phase, setPhase] = useState<Phase>('open')
  const [success, setSuccess] = useState<boolean | null>(null)
  const [receipts, setReceipts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const unifold = useMemo(() => makeUnifold(flags), [])
  const solana = useMemo(() => makeSolana(flags), [])
  const verifier = useMemo(() => makeVerifier(flags), [])

  const pools = market ? computePools(market) : { escrow: 0, support: 0, doubt: 0 }

  async function stake(userId: string, name: string, side: StakeSide, amount: number) {
    if (!market) return
    setError(null)
    try {
      await unifold.deposit(userId, amount)
      const updatedMarket = { ...market, stakes: [...market.stakes, { userId, name, side, amount }] }
      saveMarket(updatedMarket)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Deposit failed'
      setError(msg)
      console.error('Stake failed:', err)
    }
  }

  async function runSettlement(evidence: string) {
    if (!market) return
    setError(null)
    setPhase('settling')
    try {
      const verdict = await verifier.verify(market, evidence)
      const payouts = settle(market, verdict.success)
      const txs = await solana.record(payouts)
      setSuccess(verdict.success)
      setReceipts(txs.map(describeReceipt))
      const updatedMarket: Market = { ...market, status: verdict.success ? 'settled_success' : 'settled_failure' }
      saveMarket(updatedMarket)
      setPhase('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Settlement failed'
      setError(msg)
      setPhase('open')
      console.error('Settlement failed:', err)
    }
  }

  return {
    market,
    pools,
    phase,
    success,
    receipts,
    error,
    back: (userId: string, name: string, amount: number) => stake(userId, name, 'back', amount),
    fade: (userId: string, name: string, amount: number) => stake(userId, name, 'fade', amount),
    runSettlement,
  }
}
