import { getSupabase } from '../lib/supabaseClient';
import { EmergencyAlert, AlertType } from '../types';

type AlertRow = {
  id: string;
  user_id: string;
  vehicle_id: string;
  type: 'flat_tire' | 'mechanical_problem' | 'accident' | 'breakdown' | 'other';
  description: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_active: boolean;
  sent_to: string[];
  created_at: string;
  resolved_at: string | null;
};

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
  };
}

export async function getAlertsByUser(userId: string): Promise<EmergencyAlert[]> {
  const s = getSupabase();
  const { data, error } = await s
    .from('emergency_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as AlertRow[]).map(mapAlert);
}

export async function countActiveAlertsByUser(userId: string): Promise<number> {
  const s = getSupabase();
  const { count, error } = await s
    .from('emergency_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);
  if (error || typeof count !== 'number') return 0;
  return count;
}

export async function createAlert(payload: Omit<EmergencyAlert, 'id' | 'createdAt' | 'resolvedAt' | 'sentTo'> & { sentTo?: string[] }) {
  const s = getSupabase();
  const { data, error } = await s
    .from('emergency_alerts')
    .insert({
      user_id: payload.userId,
      vehicle_id: payload.vehicleId,
      type: payload.type,
      description: payload.description,
      latitude: payload.location.latitude,
      longitude: payload.location.longitude,
      address: payload.location.address ?? null,
      is_active: payload.isActive,
      sent_to: payload.sentTo ?? [],
    })
    .select('*')
    .single();
  if (error || !data) return { alert: null, error };
  return { alert: mapAlert(data as AlertRow), error: null };
}

export async function resolveAlert(id: string) {
  const s = getSupabase();
  const { data, error } = await s
    .from('emergency_alerts')
    .update({ is_active: false, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return { alert: null, error };
  return { alert: mapAlert(data as AlertRow), error: null };
}

export async function deleteAlert(id: string) {
  const s = getSupabase();
  const { error } = await s
    .from('emergency_alerts')
    .delete()
    .eq('id', id);
  return { error };
}