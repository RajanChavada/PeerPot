import { describe, it, expect } from 'vitest'
import { makeVerifier } from './verify'
import { seedDemoMarket } from '../core/store'

const off = { unifold: false, solana: false, elevenlabs: false, backboard: false, supabase: false }

describe('verify mock', () => {
  it('passes when evidence mentions 5 PRs', async () => {
    const v = await makeVerifier(off).verify(seedDemoMarket(), 'merged 5 PRs today')
    expect(v.success).toBe(true)
    expect(v.mocked).toBe(true)
  })
  it('fails on weak evidence', async () => {
    const v = await makeVerifier(off).verify(seedDemoMarket(), 'did 2 PRs')
    expect(v.success).toBe(false)
  })
})
