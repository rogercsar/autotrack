import { getSupabase } from '../lib/supabaseClient'
import { EmergencyAlert } from '../types'

export const getAlertsByUser = async (userId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('emergency_alerts')
    .select('*')
    .eq('userId', userId)
  if (error) throw error
  return data
}

export const createAlert = async (
  alertData: Omit<EmergencyAlert, 'id' | 'createdAt' | 'resolvedAt' | 'sentTo'>
) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('emergency_alerts')
    .insert(alertData)
    .select()
  if (error) throw error
  return { alert: data?.[0], error }
}

export const resolveAlert = async (alertId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('emergency_alerts')
    .update({ isActive: false, resolvedAt: new Date() })
    .eq('id', alertId)
    .select()
  if (error) throw error
  return { alert: data?.[0], error }
}

export const deleteAlert = async (alertId: string) => {
  const s = getSupabase()
  const { error } = await s.from('emergency_alerts').delete().eq('id', alertId)
  return { error }
}

export const countActiveAlertsByUser = async (userId: string) => {
  const s = getSupabase()
  const { count, error } = await s
    .from('emergency_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId)
    .eq('isActive', true)
  if (error) throw error
  return count || 0
}
