import { getSupabase } from '../lib/supabaseClient'

export const getTransfersInvolved = async () => {
  const s = getSupabase()
  const { data: userData, error: userError } = await s.auth.getUser()
  if (userError) return { data: null, error: userError }
  const userId = userData.user.id
  const { data, error } = await s
    .from('vehicle_transfers')
    .select('*')
    .or(`fromUserId.eq.${userId},toUserId.eq.${userId}`)
  return { data, error }
}

export const createTransfer = async (
  vehicleId: string,
  toUserId: string,
  message?: string
) => {
  const s = getSupabase()
  const { data: userData, error: userError } = await s.auth.getUser()
  if (userError) return { transfer: null, error: userError }
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
  return { transfer: data?.[0], error }
}

export const rejectTransfer = async (transferId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('vehicle_transfers')
    .update({ status: 'rejected', completedAt: new Date() })
    .eq('id', transferId)
    .select()
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
