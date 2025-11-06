import {
  getAlertsByUser as getAlertsByUserFromApi,
  createAlert as createAlertFromApi,
  resolveAlert as resolveAlertFromApi,
  deleteAlert as deleteAlertFromApi,
  countActiveAlertsByUser as countActiveAlertsByUserFromApi,
} from '../api/alerts'
import { EmergencyAlert, AlertType } from '../types'

type AlertRow = {
  id: string
  user_id: string
  vehicle_id: string
  type: 'flat_tire' | 'mechanical_problem' | 'accident' | 'breakdown' | 'other'
  description: string
  latitude: number
  longitude: number
  address: string | null
  is_active: boolean
  sent_to: string[]
  created_at: string
  resolved_at: string | null
}

function mapAlert(row: AlertRow): EmergencyAlert {
  return {
    id: row.id,
    userId: row.user_id,
    vehicleId: row.vehicle_id,
    type: row.type as AlertType,
    description: row.description,
    location: {
      latitude: row.latitude,
      longitude: row.longitude,
      address: row.address || undefined,
    },
    isActive: row.is_active,
    sentTo: row.sent_to || [],
    createdAt: new Date(row.created_at),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
  }
}

export async function getAlertsByUser(
  userId: string
): Promise<EmergencyAlert[]> {
  const { data, error } = await getAlertsByUserFromApi(userId)
  if (error || !data) return []
  return (data as AlertRow[]).map(mapAlert)
}

export async function countActiveAlertsByUser(userId: string): Promise<number> {
  const { count, error } = await countActiveAlertsByUserFromApi(userId)
  if (error || typeof count !== 'number') return 0
  return count
}

export async function createAlert(
  payload: Omit<
    EmergencyAlert,
    'id' | 'createdAt' | 'resolvedAt' | 'sentTo'
  > & {
    sentTo?: string[]
  }
) {
  const { alert, error } = await createAlertFromApi(payload)
  if (error || !alert) return { alert: null, error }
  return { alert: mapAlert(alert as AlertRow), error: null }
}

export async function resolveAlert(id: string) {
  const { alert, error } = await resolveAlertFromApi(id)
  if (error || !alert) return { alert: null, error }
  return { alert: mapAlert(alert as AlertRow), error: null }
}

export async function deleteAlert(id: string) {
  return await deleteAlertFromApi(id)
}
