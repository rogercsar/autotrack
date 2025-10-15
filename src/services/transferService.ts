import { getSupabase } from '../lib/supabaseClient';
import { VehicleTransfer } from '../types';

type VehicleTransferRow = {
  id: string;
  vehicle_id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
  completed_at: string | null;
};

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
  };
}

export async function getTransfersInvolved(): Promise<VehicleTransfer[]> {
  const s = getSupabase();
  const { data, error } = await s
    .from('vehicle_transfers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as VehicleTransferRow[]).map(mapTransfer);
}

export async function getTransfersByVehicle(vehicleId: string): Promise<VehicleTransfer[]> {
  const s = getSupabase();
  const { data, error } = await s
    .from('vehicle_transfers')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as VehicleTransferRow[]).map(mapTransfer);
}

export async function createTransfer(vehicleId: string, toUserId: string, message?: string) {
  const s = getSupabase();
  const { data: userRes } = await s.auth.getUser();
  const fromUserId = userRes?.user?.id;
  if (!fromUserId) return { transfer: null, error: new Error('Usuário não autenticado') };
  const { data, error } = await s
    .from('vehicle_transfers')
    .insert({
      vehicle_id: vehicleId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      status: 'pending',
      message: message ?? null,
    })
    .select('*')
    .single();
  if (error || !data) return { transfer: null, error };
  return { transfer: mapTransfer(data as VehicleTransferRow), error: null };
}

export async function acceptTransfer(transferId: string) {
  const s = getSupabase();
  const { data, error } = await s
    .from('vehicle_transfers')
    .update({ status: 'accepted', completed_at: new Date().toISOString() })
    .eq('id', transferId)
    .select('*')
    .single();
  if (error || !data) return { transfer: null, error };
  return { transfer: mapTransfer(data as VehicleTransferRow), error: null };
}

export async function rejectTransfer(transferId: string) {
  const s = getSupabase();
  const { data, error } = await s
    .from('vehicle_transfers')
    .update({ status: 'rejected', completed_at: new Date().toISOString() })
    .eq('id', transferId)
    .select('*')
    .single();
  if (error || !data) return { transfer: null, error };
  return { transfer: mapTransfer(data as VehicleTransferRow), error: null };
}

export async function deleteTransfer(transferId: string) {
  const s = getSupabase();
  const { error } = await s.from('vehicle_transfers').delete().eq('id', transferId);
  return { error };
}