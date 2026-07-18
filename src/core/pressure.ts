const WINDOW_MS = 14 * 24 * 60 * 60 * 1000

// 0 when the deadline is a full window (2 weeks) away, rising to 1 at/after it.
export function deadlinePressure(deadlineIso: string, nowMs: number): number {
  const remaining = Date.parse(deadlineIso) - nowMs
  if (remaining <= 0) return 1
  return Math.max(0, Math.min(1, 1 - remaining / WINDOW_MS))
}
