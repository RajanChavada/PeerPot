import { describe, it, expect } from 'vitest'
import { makeUnifold } from './unifold'

describe('unifold mock', () => {
  const u = makeUnifold({ unifold: false, solana: false, elevenlabs: false, backboard: false, supabase: false })
  it('mock deposit is deterministic and marked mocked', async () => {
    const r = await u.deposit('maya', 20)
    expect(r).toEqual({ ok: true, ref: 'mock:maya:20', mocked: true })
  })
  it('rejects non-positive amounts', async () => {
    await expect(u.deposit('x', 0)).rejects.toThrow()
  })
})
