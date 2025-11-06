import { getSupabase } from '../lib/supabaseClient'
import { Vehicle } from '../types'

export const getVehiclesByOwner = async (ownerId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('vehicles')
    .select('*')
    .eq('ownerId', ownerId)
  if (error) throw error
  return data
}

export const createVehicle = async (vehicleData: Partial<Vehicle>) => {
  const s = getSupabase()
  const { data, error } = await s.from('vehicles').insert(vehicleData).select()
  if (error) throw error
  return { vehicle: data?.[0], error }
}

export const updateVehicle = async (
  vehicleId: string,
  vehicleData: Partial<Vehicle>
) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('vehicles')
    .update(vehicleData)
    .eq('id', vehicleId)
    .select()
  if (error) throw error
  return { vehicle: data?.[0], error }
}

export const deleteVehicle = async (vehicleId: string) => {
  const s = getSupabase()
  const { error } = await s.from('vehicles').delete().eq('id', vehicleId)
  return { error }
}
