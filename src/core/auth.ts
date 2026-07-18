import { useState, useEffect } from 'react'

export interface UserSession {
  id: string
  name: string
  avatarBase64?: string
}

const AUTH_KEY = 'stakes_auth_session'

export function getSession(): UserSession | null {
  const data = localStorage.getItem(AUTH_KEY)
  return data ? JSON.parse(data) : null
}

export function saveSession(session: UserSession) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('stakes_auth_changed'))
}

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(getSession())

  useEffect(() => {
    function handleUpdate() {
      setSession(getSession())
    }

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('stakes_auth_changed', handleUpdate)
    
    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('stakes_auth_changed', handleUpdate)
    }
  }, [])

  return session
}
