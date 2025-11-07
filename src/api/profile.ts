import { getSupabase } from '../lib/supabaseClient'
import { UserType } from '../types'

export const getProfileById = async (userId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const createProfile = async (profileData: {
  id: string
  name: string
  email: string
  userType: UserType
}) => {
  const s = getSupabase()
  const { data, error } = await s.from('profiles').insert([profileData])
  return { data, error }
}

export const getProfileByEmail = async (email: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()
  return { data, error }
}

export const updateUserType = async (userId: string, userType: UserType) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('profiles')
    .update({ userType })
    .eq('id', userId)
  return { data, error }
}
