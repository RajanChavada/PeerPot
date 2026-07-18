import { UserProfileSchema, type UserProfile } from './types'

const USERS_KEY = 'stakes_users'

export function getAllProfiles(): UserProfile[] {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  return UserProfileSchema.array().parse(JSON.parse(raw))
}

export function getProfile(id: string): UserProfile | undefined {
  return getAllProfiles().find(p => p.id === id)
}

export function saveProfile(profile: UserProfile): void {
  const all = getAllProfiles()
  const i = all.findIndex(p => p.id === profile.id)
  if (i !== -1) all[i] = profile
  else all.push(profile)
  localStorage.setItem(USERS_KEY, JSON.stringify(all))
  window.dispatchEvent(new Event('stakes_users_changed'))
}

export function generateFriendCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function addFriendByCode(myId: string, code: string): UserProfile | null {
  const me = getProfile(myId)
  if (!me) return null
  const friend = getAllProfiles().find(p => p.friendCode === code)
  if (!friend || friend.id === myId) return null
  if (!me.friends.includes(friend.id)) {
    saveProfile({ ...me, friends: [...me.friends, friend.id] })
  }
  if (!friend.friends.includes(myId)) {
    saveProfile({ ...friend, friends: [...friend.friends, myId] })
  }
  return getProfile(friend.id) ?? null
}

export function getFriends(myId: string): UserProfile[] {
  const me = getProfile(myId)
  if (!me) return []
  return me.friends
    .map(id => getProfile(id))
    .filter((p): p is UserProfile => p !== undefined)
}
