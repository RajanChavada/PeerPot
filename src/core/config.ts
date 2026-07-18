export interface IntegrationFlags {
  unifold: boolean
  solana: boolean
  elevenlabs: boolean
  backboard: boolean
  supabase: boolean
}

const has = (v: string | undefined) => typeof v === 'string' && v.length > 0

export function resolveFlags(env: Record<string, string | undefined>): IntegrationFlags {
  return {
    unifold: has(env.VITE_UNIFOLD_API_KEY),
    solana: has(env.VITE_SOLANA_RPC),
    elevenlabs: has(env.VITE_ELEVENLABS_API_KEY),
    backboard: has(env.VITE_BACKBOARD_API_KEY),
    supabase: has(env.VITE_SUPABASE_URL) && has(env.VITE_SUPABASE_ANON_KEY),
  }
}

export const flags: IntegrationFlags = resolveFlags(
  import.meta.env as Record<string, string | undefined>,
)

/** Raw env accessors for adapters that need the actual key values. */
export function getEnv(key: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[key]
  if (!v) throw new Error(`Missing env: ${key}`)
  return v
}
