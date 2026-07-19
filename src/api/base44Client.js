// Supabase-backed data + auth client. Drop-in replacement for the base44 SDK —
// same `base44.auth.*` and `base44.entities.{Session,Commitment}.*` surface the
// pages already call, so nothing else had to change.
//
// Fallback-first (copied from the HT6-stakes-2 backend convention): with no
// VITE_SUPABASE_* env keys, everything runs on localStorage so the demo works
// fully offline. Add the two keys and it syncs across devices — no code change.
//
// Supabase setup (SQL editor), one table per entity, generic jsonb blob:
//   create table sessions    (id text primary key, data jsonb not null);
//   create table commitments (id text primary key, data jsonb not null);
//   alter table sessions    enable row level security;
//   alter table commitments enable row level security;
//   -- public read/write policies (demo): using (true) / with check (true)
// And Authentication → Providers → Email → turn OFF "Confirm email" so signup
// returns a session immediately.

const URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const remote = Boolean(URL && KEY)

const SESSION_KEY = 'stakes_session'

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}
function writeSession(s) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  else localStorage.removeItem(SESSION_KEY)
}

function restHeaders() {
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
}

function genId() {
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// One entity = one {id, data} table (remote) or one localStorage array (offline).
// Sort/filter run in JS over the full set — fine at demo scale.
// ponytail: fetch-all + in-memory filter; swap to PostgREST query params if the
// dataset ever outgrows a demo.
function makeEntity(table) {
  const localKey = `stakes_${table}`

  async function all() {
    if (remote) {
      const res = await fetch(`${URL}/rest/v1/${table}?select=data`, { headers: restHeaders() })
      if (!res.ok) throw new Error(`Fetch ${table} failed (${res.status})`)
      return (await res.json()).map((r) => r.data)
    }
    try {
      return JSON.parse(localStorage.getItem(localKey)) || []
    } catch {
      return []
    }
  }

  async function save(record) {
    if (remote) {
      const res = await fetch(`${URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...restHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ id: record.id, data: record }),
      })
      if (!res.ok) throw new Error(`Save ${table} failed (${res.status})`)
    } else {
      const rows = (await all()).filter((r) => r.id !== record.id)
      rows.push(record)
      localStorage.setItem(localKey, JSON.stringify(rows))
    }
    return record
  }

  return {
    async list(sort = '-created_date', limit = 100) {
      const rows = await all()
      const key = sort.replace(/^-/, '')
      const desc = sort.startsWith('-')
      rows.sort((a, b) => {
        const av = a[key] ?? ''
        const bv = b[key] ?? ''
        if (av === bv) return 0
        return desc ? (av < bv ? 1 : -1) : av > bv ? 1 : -1
      })
      return rows.slice(0, limit)
    },
    async get(id) {
      return (await all()).find((r) => r.id === id) || null
    },
    async filter(query) {
      return (await all()).filter((r) =>
        Object.entries(query).every(([k, v]) => r[k] === v),
      )
    },
    async create(data) {
      const record = {
        ...data,
        id: genId(),
        created_date: new Date().toISOString(),
        created_by_id: readSession()?.id ?? null,
      }
      return save(record)
    },
    async update(id, patch) {
      const existing = await this.get(id)
      if (!existing) throw new Error(`${table} ${id} not found`)
      return save({ ...existing, ...patch })
    },
  }
}

// GoTrue email/password over REST (mirrors HT6-stakes-2/src/core/supabaseAuth.ts).
async function goTrue(path, body) {
  const res = await fetch(`${URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.msg || json.error_description || json.error || `Auth failed (${res.status})`)
  }
  return json
}

function sessionFromGoTrue(r) {
  return {
    id: r.user.id,
    email: r.user.email,
    full_name: r.user.email,
    accessToken: r.access_token,
  }
}

const auth = {
  async me() {
    const s = readSession()
    if (!s) {
      const e = new Error('Not authenticated')
      e.status = 401
      throw e
    }
    return s
  },
  async loginViaEmailPassword(email, password) {
    if (remote) {
      const s = sessionFromGoTrue(await goTrue('token?grant_type=password', { email, password }))
      writeSession(s)
      return s
    }
    const s = { id: 'user_' + email, email, full_name: email } // guest fallback
    writeSession(s)
    return s
  },
  async register({ email, password }) {
    if (remote) {
      const r = await goTrue('signup', { email, password })
      if (r.access_token && r.user) writeSession(sessionFromGoTrue(r))
      return r
    }
    const s = { id: 'user_' + email, email, full_name: email }
    writeSession(s)
    return s
  },
  logout() {
    writeSession(null)
  },
}

export const base44 = {
  auth,
  entities: {
    Session: makeEntity('sessions'),
    Commitment: makeEntity('commitments'),
    RecurringCommitment: makeEntity('recurring_commitments'),
  },
  functions: {
    invoke: async (name, data) => {
      console.log(`[Base44] Invoking real deployed function: ${name}`, data);
      const res = await fetch(`/api/functions/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(errorText || res.statusText);
      }
      return { data: await res.json() };
    },
    fetch: async (path, init) => {
      console.log(`[Mock Base44] Fetched function: ${path}`, init)
      return new Response(JSON.stringify({ success: true }))
    }
  },
}
