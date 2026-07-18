import type { TxReceipt } from '../adapters/solana'

export function describeReceipt(r: TxReceipt): string {
  const tail = '→ confirmed on-chain'
  if (r.kind === 'cause') return `$${r.amount} sent to your cause ${tail}`
  if (r.kind === 'creator') return `You got your $${r.amount} stake back ${tail}`
  return `${r.toUserId} won $${r.amount} ${tail}`
}
