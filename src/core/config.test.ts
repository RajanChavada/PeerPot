import { describe, it, expect } from 'vitest'
import { resolveFlags } from './config'

describe('resolveFlags', () => {
  it('all false with empty env', () => {
    expect(resolveFlags({})).toEqual({ unifold: false, solana: false, elevenlabs: false, backboard: false })
  })
  it('flips a flag when its key is present', () => {
    expect(resolveFlags({ VITE_BACKBOARD_API_KEY: 'x' }).backboard).toBe(true)
  })
  it('treats empty string as absent', () => {
    expect(resolveFlags({ VITE_BACKBOARD_API_KEY: '' }).backboard).toBe(false)
  })
})
