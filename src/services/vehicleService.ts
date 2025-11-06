import {
  getVehiclesByOwner as getVehiclesByOwnerFromApi,
  createVehicle as createVehicleFromApi,
  updateVehicle as updateVehicleFromApi,
  deleteVehicle as deleteVehicleFromApi,
} from '../api/vehicle'
import { Vehicle } from '../types'

type VehicleRow = {
  id: string
  owner_id: string
  plate: string
  model: string
  year: number
  color: string
  renavam: string
  photo: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

function mapVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    ownerId: row.owner_id,
    plate: row.plate,
    model: row.model,
    year: row.year,
    color: row.color,
    renavam: row.renavam,
    photo: row.photo || undefined,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export async function getVehiclesByOwner(ownerId: string): Promise<Vehicle[]> {
  const data = await getVehiclesByOwnerFromApi(ownerId)
  if (!data) return []
  return (data as VehicleRow[]).map(mapVehicle)
}

export async function createVehicle(
  payload: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & {
    isActive?: boolean
  }
) {
  const { vehicle, error } = await createVehicleFromApi(payload)
  if (error || !vehicle) return { vehicle: null, error }
  return { vehicle: mapVehicle(vehicle as VehicleRow), error: null }
}

export async function updateVehicle(
  id: string,
  changes: Partial<Omit<Vehicle, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>
) {
  const { vehicle, error } = await updateVehicleFromApi(id, changes)
  if (error || !vehicle) return { vehicle: null, error }
  return { vehicle: mapVehicle(vehicle as VehicleRow), error: null }
}

export async function deleteVehicle(id: string) {
  return await deleteVehicleFromApi(id)
}
