# Phase 2: Multiplayer & UX Polish

This phase transforms the Stakes MVP from a single-player demo with hardcoded users into a live, multiplayer experience that can be shared via links. 

## Open Questions & Business Logic Decisions

> [!WARNING]  
> **Fader Win Mechanics**  
> Currently, if the creator fails, the faders simply get their original stake back, and the rest (escrow + backing pool) is donated to a cause.  
> **Should we change this?** In a true prediction market, if the faders are right, they should be rewarded for betting against the creator. 
> *Option A:* Keep it charity-focused (current logic).  
> *Option B:* Payout the Escrow + Backing Pool proportionally to the Faders (mirroring what happens when backers win). Let me know which you prefer!

> [!NOTE]  
> **Persistence Layer**  
> To allow sharing commitments via links/codes, we need a lightweight persistence layer. I recommend a simple Key-Value store (like Vercel KV, Supabase, or Firebase). Are you deploying to Vercel? If so, Vercel KV is the absolute fastest to set up.

## Proposed Changes

### 1. Multi-Screen Architecture & Ephemeral Auth
We will introduce a simple router (or state-based screen manager) to handle the flow:
- **Onboarding Screen**: If a user has no local session, prompt them to enter a screen name and upload a PFP (stored in LocalStorage).
- **Lobby/Dashboard**: View active commitments or create a new one (sets goal, deadline, and escrow amount).
- **Market Screen**: The main "Blob" view where a user lands when clicking a shareable link (e.g. `?market=xyz`).
- **Settlement Screen**: Dedicated post-game summary screen.

### 2. Ephemeral Persistence (Multiplayer)
- Replace the local React `useState` `market` store with a synchronized backend state.
- When a user shares a link, anyone who opens it can add their stake.
- The state is read from the backend, so all users see the pot grow in real-time.

### 3. Visual & UX Upgrades
- **Dynamic Pot Visual**: Modify the Three.js `Pot.tsx` to dynamically map the scale and noise variables to the actual dollar amounts in the Escrow, Backing, and Doubt pools, allowing it to visually grow as more money is staked.
- **Expiration Dates**: Add a deadline selector when creating a commitment. The Backboard AI prompt will be updated to receive the current timestamp and the deadline, factoring time expiration into its success/failure judgment.

### 4. Code Structure Changes

#### [NEW] `src/core/db.ts`
- Implement a lightweight adapter for our chosen persistence layer (e.g. KV) to fetch and mutate `Market` objects by ID.

#### [MODIFY] `src/App.tsx`
- Refactor into a multi-screen router.

#### [NEW] `src/screens/Onboarding.tsx`
- Simple form to capture username and PFP (base64 or avatar URL) into LocalStorage.

#### [NEW] `src/screens/CreateMarket.tsx`
- Form for the creator to set their goal, deadline, and put up their Unifold escrow.

#### [MODIFY] `src/three/Pot.tsx`
- Wire up `potValue` to the Three.js `scale` and `distortion` uniforms so the blob visually reacts to incoming stakes.

## Verification Plan

### Manual Verification
- Generate a new commitment link.
- Open the link in an incognito window, create a new username, and add a "Fade" stake.
- Verify the main window's pot visually expands in real-time.
- Attempt to settle the pot past the expiration date to verify the LLM appropriately fails the creator for missing the deadline.
