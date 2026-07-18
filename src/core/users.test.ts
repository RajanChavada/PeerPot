import { it, expect, beforeEach } from 'vitest'
import {
  getProfile, getAllProfiles, saveProfile,
  generateFriendCode, addFriendByCode, getFriends,
} from './users'
import type { UserProfile } from './types'

const mk = (id: string, name: string): UserProfile => ({
  id, name, friendCode: id + 'code', friends: [],
})

beforeEach(() => localStorage.clear())

it('saves and reads back a profile', () => {
  saveProfile(mk('u1', 'Ada'))
  expect(getProfile('u1')?.name).toBe('Ada')
})

it('upserts by id rather than duplicating', () => {
  saveProfile(mk('u1', 'Ada'))
  saveProfile({ ...mk('u1', 'Ada Lovelace'), friends: ['u2'] })
  expect(getAllProfiles()).toHaveLength(1)
  expect(getProfile('u1')?.name).toBe('Ada Lovelace')
  expect(getProfile('u1')?.friends).toEqual(['u2'])
})

it('returns undefined for unknown id', () => {
  expect(getProfile('nope')).toBeUndefined()
})

it('generates a 6-char friend code', () => {
  expect(generateFriendCode()).toHaveLength(6)
})

it('adds a friend by code, mutually', () => {
  saveProfile({ id: 'u1', name: 'Ada', friendCode: 'AAA111', friends: [] })
  saveProfile({ id: 'u2', name: 'Bo', friendCode: 'BBB222', friends: [] })
  const friend = addFriendByCode('u1', 'BBB222')
  expect(friend?.id).toBe('u2')
  expect(getProfile('u1')?.friends).toEqual(['u2'])
  expect(getProfile('u2')?.friends).toEqual(['u1'])
})

it('is idempotent and rejects self / unknown codes', () => {
  saveProfile({ id: 'u1', name: 'Ada', friendCode: 'AAA111', friends: [] })
  saveProfile({ id: 'u2', name: 'Bo', friendCode: 'BBB222', friends: [] })
  addFriendByCode('u1', 'BBB222')
  addFriendByCode('u1', 'BBB222')
  expect(getProfile('u1')?.friends).toEqual(['u2'])
  expect(addFriendByCode('u1', 'AAA111')).toBeNull()
  expect(addFriendByCode('u1', 'ZZZ999')).toBeNull()
})

it('resolves friends to profiles', () => {
  saveProfile({ id: 'u1', name: 'Ada', friendCode: 'AAA111', friends: ['u2'] })
  saveProfile({ id: 'u2', name: 'Bo', friendCode: 'BBB222', friends: ['u1'] })
  expect(getFriends('u1').map(p => p.name)).toEqual(['Bo'])
})
