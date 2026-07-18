import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Force mock flags so tests always use the mock adapters, regardless of .env
vi.mock('../core/config', async (importOriginal) => {
  const orig = await importOriginal() as Record<string, unknown>
  return {
    ...orig,
    flags: { unifold: false, solana: false, elevenlabs: false, gemini: false },
    getEnv: () => { throw new Error('tests should not call getEnv') },
  }
})

import { useStakesMachine } from './useStakesMachine'

describe('useStakesMachine', () => {
  it('back adds to support pool', async () => {
    const { result } = renderHook(() => useStakesMachine())
    const before = result.current.pools.support
    await act(async () => { await result.current.back('newbacker', 10) })
    expect(result.current.pools.support).toBe(before + 10)
  })
  it('fade adds to doubt pool', async () => {
    const { result } = renderHook(() => useStakesMachine())
    const before = result.current.pools.doubt
    await act(async () => { await result.current.fade('skeptic', 8) })
    expect(result.current.pools.doubt).toBe(before + 8)
  })
  it('runSettlement with success evidence produces receipts and success phase', async () => {
    const { result } = renderHook(() => useStakesMachine())
    await act(async () => { await result.current.runSettlement('merged 5 PRs') })
    expect(result.current.phase).toBe('done')
    expect(result.current.success).toBe(true)
    expect(result.current.receipts.length).toBeGreaterThan(0)
  })
  it('runSettlement with weak evidence fails and pays out to faders', async () => {
    const { result } = renderHook(() => useStakesMachine())
    await act(async () => { await result.current.runSettlement('only 2 PRs') })
    expect(result.current.success).toBe(false)
    expect(result.current.receipts.some(r => r.toLowerCase().includes('won $'))).toBe(true)
  })
})
