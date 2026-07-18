import { describe, it, expect } from 'vitest'
import { potVisual } from './potVisual'

describe('potVisual', () => {
  it('empty far-from-deadline pot is small, calm, green', () => {
    const v = potVisual(0, 0)
    expect(v.scale).toBeCloseTo(1)
    expect(v.hue).toBeGreaterThan(100)
    expect(v.distortSpeed).toBeCloseTo(0, 1)
  })
  it('full pot near deadline is large, fast, warm', () => {
    const v = potVisual(500, 1)
    expect(v.scale).toBeGreaterThan(1.5)
    expect(v.hue).toBeLessThan(40)
    expect(v.bloom).toBeGreaterThan(0.5)
  })
  it('scales indefinitely but slowly (logarithmically)', () => {
    const v100 = potVisual(100, 0)
    const v1000 = potVisual(1000, 0)
    expect(v1000.scale).toBeGreaterThan(v100.scale)
  })
})
