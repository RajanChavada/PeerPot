import { z } from 'zod'

export type StakeSide = 'back' | 'fade'
export type MarketStatus = 'open' | 'settled_success' | 'settled_failure'

export const StakeSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  side: z.enum(['back', 'fade']),
  amount: z.number().nonnegative(),
})
export const MarketSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  creatorName: z.string().optional(),
  goal: z.string().min(1),
  creatorStake: z.number().nonnegative(),
  deadlineIso: z.string(),
  causeId: z.string(),
  stakes: z.array(StakeSchema),
  status: z.enum(['open', 'settled_success', 'settled_failure']),
  visibility: z.enum(['public', 'friends']).default('public'),
})
export type Stake = z.infer<typeof StakeSchema>
export type Market = z.infer<typeof MarketSchema>
export interface Cause {
  id: string
  name: string
}

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarBase64: z.string().optional(),
  friendCode: z.string(),
  friends: z.array(z.string()).default([]),
})
export type UserProfile = z.infer<typeof UserProfileSchema>
