import { describe, it, expect } from 'vitest'
import { makeSolana } from './solana'

describe('solana mock', () => {
  const s = makeSolana({ unifold: false, solana: false, elevenlabs: false, backboard: false, supabase: false })
  it('records one mock receipt per payout', async () => {
    const rs = await s.record([
      { toUserId: 'you', amount: 50, kind: 'creator' },
      { toUserId: 'sam', amount: 15, kind: 'backer' },
    ])
    expect(rs.map(r => r.sig)).toEqual(['mocksig-0', 'mocksig-1'])
    expect(rs.every(r => r.mocked)).toBe(true)
    expect(rs[1].amount).toBe(15)
  })
})
