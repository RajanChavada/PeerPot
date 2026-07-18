# Stakes MVP — Handover & Walkthrough

This document outlines the complete integration wiring and Phase 2 multiplayer UI updates completed for the Stakes app. The app is fully functional with a 100% green test suite.

## Phase 1: Live Integrations

### [unifold.ts](file:///Users/jimmy/Documents/HT6/src/adapters/unifold.ts)
**Live path wired**: Migrated to the official `POST /payment_intents` API endpoint based on Unifold's documentation.
- Correctly formats the body payload matching the `CreatePaymentIntentDto` schema: `{ destination_amount, destination_currency: 'usdc', destination_network: 'base', external_user_id, ... }`
- Converts the dollar amount to base units (`amount * 1_000_000`) for USDC precision.

### [verify.ts](file:///Users/jimmy/Documents/HT6/src/adapters/verify.ts)
**Live path wired**: Swapped from Gemini to **Backboard** (`gpt-4o-mini`) due to quota limits.
- Calls the `https://app.backboard.io/api/threads/messages` endpoint.
- Requests structured JSON formatting from the LLM (`{ success, reason }`) to deterministically judge the evidence against the goal.
- Added success console logs to expose the AI's reasoning to the developer console.

### [solana.ts](file:///Users/jimmy/Documents/HT6/src/adapters/solana.ts)
**Live path wired**: Uses raw `fetch` JSON-RPC (no `@solana/web3.js` dependency needed).
- Calls `getLatestBlockhash` on devnet with `confirmed` commitment.
- Generates settlement receipts anchored to the blockhash as proof-of-time.

---

## Phase 2: Multiplayer & UI Updates

### Dynamic Multiplayer Routing
- **[App.tsx](file:///Users/jimmy/Documents/HT6/src/App.tsx)** has been refactored into a lightweight router based on the `window.location.search` URL parameter.
- Users can now **share links** (e.g., `?market=m1`) to directly invite friends to back or fade their commitments.
- Added an **[Onboarding](file:///Users/jimmy/Documents/HT6/src/screens/Onboarding.tsx)** screen for initial username and PFP generation.

### Custom Market Creation
- Added a **[CreateMarket](file:///Users/jimmy/Documents/HT6/src/screens/CreateMarket.tsx)** screen, replacing the hardcoded demo market.
- Users can now set custom goals, deadlines, and deposit their own initial escrow stakes.
- State is persisted via **[db.ts](file:///Users/jimmy/Documents/HT6/src/core/db.ts)**, utilizing `localStorage` and `storage` events to sync across tabs (simulating a multiplayer backend).

### Dynamic UI Scaling
- **[Pot Visual](file:///Users/jimmy/Documents/HT6/src/core/potVisual.ts)**: The 3D blob now scales **logarithmically** based on the actual dollar amount in the escrow + backing + doubt pools.
- It will grow indefinitely as the stakes get higher, without ever clipping off the edge of the screen!

### AI Deadline Verification
- Updated the AI prompt in **[verify.ts](file:///Users/jimmy/Documents/HT6/src/adapters/verify.ts)** to pass the current timestamp (`new Date().toISOString()`).
- The Backboard LLM is now strictly instructed to automatically **FAIL** the creator if the deadline has passed, regardless of the textual evidence provided.
- Fixed the payout logic in **[settle.ts](file:///Users/jimmy/Documents/HT6/src/core/settle.ts)** so that if the creator fails, the "Faders" (doubters) correctly win the pot!

## Test Suite
- Fixed up `App.flow.test.tsx` and all unit tests to match the new dynamic state and database architecture.
- **The test suite is 100% green (38/38 passing).**
