import { getSupabase } from '../lib/supabaseClient'

export const getTransfersInvolved = async () => {
  const s = getSupabase()
  const { data: userData, error: userError } = await s.auth.getUser()
  if (userError) throw userError
  const userId = userData.user.id
  const { data, error } = await s
    .from('vehicle_transfers')
    .select('*')
    .or(`fromUserId.eq.${userId},toUserId.eq.${userId}`)
  if (error) throw error
  return data
}

export const createTransfer = async (
  vehicleId: string,
  toUserId: string,
  message?: string
) => {
  const s = getSupabase()
  const { data: userData, error: userError } = await s.auth.getUser()
  if (userError) throw userError
  const fromUserId = userData.user.id
  const { data, error } = await s
    .from('vehicle_transfers')
    .insert({
      vehicleId,
      fromUserId,
      toUserId,
      message,
      status: 'pending',
    })
    .select()
  if (error) throw error
  return { transfer: data?.[0], error }
}

export const acceptTransfer = async (transferId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('vehicle_transfers')
    .update({ status: 'accepted', completedAt: new Date() })
    .eq('id', transferId)
    .select()
  // TODO: Add logic to change vehicle owner
  if (error) throw error
  return { transfer: data?.[0], error }
}

export const rejectTransfer = async (transferId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('vehicle_transfers')
    .update({ status: 'rejected', completedAt: new Date() })
    .eq('id', transferId)
    .select()
  if (error) throw error
  return { transfer: data?.[0], error }
}

export const deleteTransfer = async (transferId: string) => {
  const s = getSupabase()
  const { error } = await s
    .from('vehicle_transfers')
    .delete()
    .eq('id', transferId)
  return { error }
}
