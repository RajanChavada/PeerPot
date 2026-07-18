export interface PotVisualState {
  scale: number
  hue: number
  distort: number
  distortSpeed: number
  bloom: number
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

// Maps pot fill + deadline pressure to a self-contained visual state.
// potValue drives scale/bloom indefinitely; pressure drives hue (green->red) and surface speed.
export function potVisual(potValue: number, deadlinePressure: number): PotVisualState {
  // Use log scaling so the blob grows dynamically but doesn't explode
  const fill = Math.log10(1 + potValue / 50)
  const pressure = clamp01(deadlinePressure)
  return {
    scale: 1 + fill * 0.8,
    hue: 130 - pressure * 110,
    distort: 0.2 + fill * 0.2,
    distortSpeed: pressure * 3,
    bloom: 0.2 + fill * 0.4,
  }
}
