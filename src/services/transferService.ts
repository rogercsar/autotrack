import {
  getTransfersInvolved as getTransfersInvolvedFromApi,
  createTransfer as createTransferFromApi,
  acceptTransfer as acceptTransferFromApi,
  rejectTransfer as rejectTransferFromApi,
  deleteTransfer as deleteTransferFromApi,
} from '../api/transfer'
import { VehicleTransfer } from '../types'

type VehicleTransferRow = {
  id: string
  vehicle_id: string
  from_user_id: string
  to_user_id: string
  status: 'pending' | 'accepted' | 'rejected'
  message: string | null
  created_at: string
  completed_at: string | null
}

function mapTransfer(row: VehicleTransferRow): VehicleTransfer {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: row.status,
    message: row.message || undefined,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  }
}

export async function getTransfersInvolved(): Promise<VehicleTransfer[]> {
  const data = await getTransfersInvolvedFromApi()
  if (!data) return []
  return (data as VehicleTransferRow[]).map(mapTransfer)
}

export async function createTransfer(
  vehicleId: string,
  toUserId: string,
  message?: string
) {
  const { transfer, error } = await createTransferFromApi(
    vehicleId,
    toUserId,
    message
  )
  if (error || !transfer) return { transfer: null, error }
  return { transfer: mapTransfer(transfer as VehicleTransferRow), error: null }
}

export async function acceptTransfer(transferId: string) {
  const { transfer, error } = await acceptTransferFromApi(transferId)
  if (error || !transfer) return { transfer: null, error }
  return { transfer: mapTransfer(transfer as VehicleTransferRow), error: null }
}

export async function rejectTransfer(transferId: string) {
  const { transfer, error } = await rejectTransferFromApi(transferId)
  if (error || !transfer) return { transfer: null, error }
  return { transfer: mapTransfer(transfer as VehicleTransferRow), error: null }
}

export async function deleteTransfer(transferId: string) {
  return await deleteTransferFromApi(transferId)
}
