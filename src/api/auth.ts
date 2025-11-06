import { getSupabase } from '../lib/supabaseClient'
import { RegisterData } from '../types'

export const signInWithPassword = async (email: string, password: string) => {
  const s = getSupabase()
  return await s.auth.signInWithPassword({ email, password })
}

export const signUp = async (userData: RegisterData) => {
  const s = getSupabase()
  return await s.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: { name: userData.name },
    },
  })
}

export const signOut = async () => {
  const s = getSupabase()
  return await s.auth.signOut()
}

export const getUser = async () => {
  const s = getSupabase()
  return await s.auth.getUser()
}

export const onAuthStateChange = (
  callback: (event: any, session: any) => void
) => {
  const s = getSupabase()
  const { data: listener } = s.auth.onAuthStateChange(callback)
  return listener
}
