import { describe, it, expect } from 'vitest'
import { describeReceipt } from './receipts'

describe('describeReceipt', () => {
  it('describes a cause payout', () => {
    expect(describeReceipt({ sig: 's', toUserId: null, amount: 90, kind: 'cause', mocked: true }))
      .toBe('$90 sent to your cause → confirmed on-chain')
  })
  it('describes a creator payout', () => {
    expect(describeReceipt({ sig: 's', toUserId: 'u1', amount: 50, kind: 'creator', mocked: true }))
      .toBe('You got your $50 stake back → confirmed on-chain')
  })
  it('describes a backer payout', () => {
    expect(describeReceipt({ sig: 's', toUserId: 'sam', amount: 15, kind: 'backer', mocked: true }))
      .toBe('sam won $15 → confirmed on-chain')
  })
})
