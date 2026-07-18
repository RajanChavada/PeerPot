# Stakes — Bet On Yourself

A commitment market. Someone stakes money on their own goal ("Ship 5 PRs by Sunday"),
friends **back** them or **fade** (bet against) them, and at the deadline the pot settles:
- **Goal met** → creator gets their stake back, backers split the doubt pool as reward.
- **Goal missed** → escrow + backing money goes to a chosen cause; faders get their stake back.

Money is made physical by **The Pot** — a living 3D orb (R3F) that grows, glows, and
pulses faster as the pot fills and the deadline nears, ringed by a 2D pressure gauge.

## Run it

```bash
npm install     # or just use the bundled node_modules
npm run dev      # http://localhost:5173
npm test         # 37 tests, all green
npm run build    # production bundle
```

**No API keys required.** With an empty `.env`, the entire demo runs on deterministic
mocks (banner reads `DEMO — all mocked`). Add any key from `.env.example` to flip that
integration to live; each is independent.

## Demo script (60 seconds)

1. Page opens on Maya's goal "Ship 5 PRs" — the Pot is already glowing (seeded backers).
2. **Back them** a couple times → watch the Pot swell and the backing pool climb.
3. **Fade them** once → the doubt pool grows.
4. Leave the evidence as-is ("merged 5 PRs") → **Settle the pot** → green burst,
   "backers win", on-chain receipts stream in.
5. Reload, change evidence to "only 2 done" → **Settle** → red burst, "cause funded".

## Architecture

Pure logic is isolated from React and from every sponsor SDK, so the whole thing is
testable headless and degrades to mocks with no keys.

```
src/
  core/          pure, framework-free, fully unit-tested
    types.ts         zod schemas: Market, Stake, Cause
    settle.ts        computePools + settle() — the payout math (fund-conserving)
    pressure.ts      deadlineIso + now → 0..1 pressure
    potVisual.ts     pot fill + pressure → {scale,hue,distort,distortSpeed,bloom}
    receipts.ts      TxReceipt → plain-English line
    store.ts         load/validate fixtures, immutable addStake
    config.ts        env keys → IntegrationFlags (live vs mock)
  adapters/      fallback-first: mock path with no key, live path behind the flag
    unifold.ts       deposit into escrow (mock: instant fake deposit)
    solana.ts        record payouts as tx receipts (mock: mocksig-N)
    verify.ts        goal verification (mock: keyword heuristic)
    voice.ts         commissioner TTS (mock: bundled clip) — built, not yet in UI
  hooks/
    useStakesMachine.ts   orchestrates store+settle+adapters; open→settling→done
  three/
    Pot.tsx          R3F Canvas: MeshDistort orb + Bloom + framer-motion pressure ring + burst
  components/
    StakePanel.tsx   back/fade controls
    BackerList.tsx   who's in, which side
    ReceiptFeed.tsx  settlement receipts (framer-motion)
  fixtures/        markets.json, causes.json (seed demo data)
  App.tsx          wires the full flow: goal → Pot → stake → settle → verdict + receipts
```

**The Pot is the only 3D surface** — a self-contained `<Canvas>` in an otherwise 2D app.
If R3F/postprocessing ever tanks on the demo machine, drop `<EffectComposer>` in `Pot.tsx`;
the framer-motion pressure ring survives regardless.

## Integrations (all optional, all fallback-first)

| Env key | Powers | Mock behavior |
|---|---|---|
| `VITE_UNIFOLD_API_KEY` | escrow deposits | instant fake deposit ref |
| `VITE_SOLANA_RPC` | on-chain settlement | `mocksig-N` receipts |
| `VITE_GEMINI_API_KEY` | goal verification | keyword heuristic (needs "5"+"PR") |
| `VITE_ELEVENLABS_API_KEY` | commissioner voice | bundled clip (needs `public/commissioner.mp3`) |
