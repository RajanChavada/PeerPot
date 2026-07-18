import { describe, it, expect } from 'vitest'
import { makeVoice, commissionerLine } from './voice'

describe('voice', () => {
  it('builds a commissioner line', () => {
    expect(commissionerLine(180, 4, 2, 3)).toContain("pot's at $180")
    expect(commissionerLine(180, 4, 2, 3)).toContain('3 days left')
  })
  it('mock line returns a bundled clip marked mocked', async () => {
    const v = makeVoice({ unifold: false, solana: false, elevenlabs: false, backboard: false, supabase: false })
    const r = await v.line('hello')
    expect(r.mocked).toBe(true)
    expect(r.text).toBe('hello')
  })
})
