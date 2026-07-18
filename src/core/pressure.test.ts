import { describe, it, expect } from 'vitest'
import { deadlinePressure } from './pressure'

const now = Date.parse('2026-07-18T00:00:00Z')

describe('deadlinePressure', () => {
  it('is ~0 when deadline is far (2 weeks window)', () => {
    expect(deadlinePressure('2026-08-01T00:00:00Z', now)).toBeLessThan(0.1)
  })
  it('is 1 at/after the deadline', () => {
    expect(deadlinePressure('2026-07-18T00:00:00Z', now)).toBe(1)
    expect(deadlinePressure('2026-07-01T00:00:00Z', now)).toBe(1)
  })
  it('rises as deadline approaches', () => {
    const far = deadlinePressure('2026-07-30T00:00:00Z', now)
    const near = deadlinePressure('2026-07-20T00:00:00Z', now)
    expect(near).toBeGreaterThan(far)
  })
})
