import type { IntegrationFlags } from '../core/config'
import { getEnv } from '../core/config'

export interface DepositResult { ok: boolean; ref: string; mocked: boolean }

// In dev, requests go through Vite's proxy (/api/unifold → api.unifold.io)
// to avoid browser CORS issues. In production, use your own backend proxy.
const UNIFOLD_API = '/api/unifold/v1'

export function makeUnifold(flags: IntegrationFlags) {
  return {
    async deposit(userId: string, amount: number): Promise<DepositResult> {
      if (amount <= 0) throw new Error('amount must be positive')
      if (!flags.unifold) return { ok: true, ref: `mock:${userId}:${amount}`, mocked: true }

      // LIVE: Unifold deposit into escrow/pool vault
      const secretKey = getEnv('VITE_UNIFOLD_SECRET_KEY')

      try {
        const res = await fetch(`${UNIFOLD_API}/payment_intents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secretKey}`,
          },
          body: JSON.stringify({
            destination_amount: Math.round(amount * 1_000_000).toString(),
            destination_currency: 'usdc',
            destination_network: 'base',
            // Default escrow wallet for Stakes app
            recipient_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            external_user_id: userId,
            metadata: { source: 'stakes-app' },
          }),
        })

        if (!res.ok) {
          const body = await res.text()
          console.warn(`Unifold deposit failed (${res.status}), falling back to mock:`, body)
          return { ok: true, ref: `mock-fallback:${userId}:${amount}`, mocked: true }
        }

        const data = await res.json()
        const intentId = data.id ?? `unifold:${userId}`
        console.log(`✅ Unifold payment intent created successfully for ${userId}:`, intentId)
        return { ok: true, ref: intentId, mocked: false }
      } catch (err) {
        console.warn('Unifold request failed, falling back to mock:', err)
        return { ok: true, ref: `mock-fallback:${userId}:${amount}`, mocked: true }
      }
    },
  }
}
