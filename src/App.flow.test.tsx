import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'

// Force mock flags so tests always use mock adapters, regardless of .env
vi.mock('./core/config', async (importOriginal) => {
  const orig = await importOriginal() as Record<string, unknown>
  return {
    ...orig,
    flags: { unifold: false, solana: false, elevenlabs: false, gemini: false },
    getEnv: () => { throw new Error('tests should not call getEnv') },
  }
})

import App from './App'

// R3F Canvas needs WebGL; stub the Pot so the flow renders in jsdom.
vi.mock('./three/Pot', () => ({ default: () => <div data-testid="pot-stub" /> }))

describe('full user flow', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the goal and starts in demo mode', () => {
    render(<App />)
    expect(screen.getByText(/Ship 5 PRs/i)).toBeInTheDocument()
    expect(screen.getByText(/DEMO — all mocked/i)).toBeInTheDocument()
  })

  it('adding a backer grows the backing pool', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Back them/i }))
    await waitFor(() => {
      const backing = screen.getByText('Backing').parentElement!
      expect(within(backing).getByText(/\$50/)).toBeInTheDocument() // 40 seed + 10
    })
  })

  it('settling with success evidence shows win + on-chain receipts', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Settle the pot/i }))
    await waitFor(() => {
      expect(screen.getByText(/backers win/i)).toBeInTheDocument()
      expect(screen.getAllByText(/confirmed on-chain/i).length).toBeGreaterThan(0)
    })
  })

  it('settling with weak evidence funds the faders', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText(/Deadline evidence/i), { target: { value: 'only 2 done' } })
    fireEvent.click(screen.getByRole('button', { name: /Settle the pot/i }))
    await waitFor(() => {
      expect(screen.getByText(/faders win/i)).toBeInTheDocument()
      expect(screen.getAllByText(/won \$/i).length).toBeGreaterThan(0)
    })
  })
})
