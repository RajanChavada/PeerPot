import type { Market } from './types'
import { flags } from './config'

// Cross-device store adapter (Supabase REST).
//
// This is FUTURE-READY: with no VITE_SUPABASE_* env keys set, `enabled` is
// false and every function no-ops, so the app runs entirely on localStorage
// (see db.ts). The moment you add the keys, markets sync across real devices
// over a shared link — no code change required.
//
// Expected table (create in Supabase SQL editor):
//   create table markets (
//     id   text primary key,
//     data jsonb not null,
//     updated_at timestamptz default now()
//   );
//   alter table markets enable row level security;
//   create policy "public read"  on markets for select using (true);
//   create policy "public write" on markets for insert with check (true);
//   create policy "public update" on markets for update using (true);

interface Row {
  id: string
  data: Market
}

export const enabled = flags.supabase

function base(): string {
  return (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '')
}

function headers(): Record<string, string> {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export async function fetchMarketsRemote(): Promise<Market[]> {
  if (!enabled) return []
  const res = await fetch(`${base()}/rest/v1/markets?select=id,data`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`)
  const rows = (await res.json()) as Row[]
  return rows.map(r => r.data)
}

export async function fetchMarketRemote(id: string): Promise<Market | undefined> {
  if (!enabled) return undefined
  const res = await fetch(
    `${base()}/rest/v1/markets?id=eq.${encodeURIComponent(id)}&select=id,data`,
    { headers: headers() },
  )
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`)
  const rows = (await res.json()) as Row[]
  return rows[0]?.data
}

export async function upsertMarketRemote(market: Market): Promise<void> {
  if (!enabled) return
  const res = await fetch(`${base()}/rest/v1/markets`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ id: market.id, data: market }),
  })
  if (!res.ok) throw new Error(`Supabase upsert failed: ${res.status}`)
}
