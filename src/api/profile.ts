import { getSupabase } from '../lib/supabaseClient'
import { UserType } from '../types'

export const getProfileById = async (userId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export const getProfileByEmail = async (email: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()
  if (error) throw error
  return data
}

export const updateUserType = async (userId: string, userType: UserType) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('profiles')
    .update({ userType })
    .eq('id', userId)
  if (error) throw error
  return data
}
