import { it, expect, beforeEach } from 'vitest'
import { signIn, updateProfile, getSession } from './auth'
import { getProfile } from './users'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

it('signIn creates a session and a profile with a friend code', () => {
  const s = signIn('Ada')
  expect(s.name).toBe('Ada')
  expect(getSession()?.id).toBe(s.id)
  const profile = getProfile(s.id)
  expect(profile?.name).toBe('Ada')
  expect(profile?.friendCode).toHaveLength(6)
})

it('updateProfile updates both profile and session', () => {
  const s = signIn('Ada')
  updateProfile(s.id, { name: 'Ada L' })
  expect(getProfile(s.id)?.name).toBe('Ada L')
  expect(getSession()?.name).toBe('Ada L')
})
