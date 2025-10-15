import { getSupabase } from '../lib/supabaseClient';
import { Vehicle } from '../types';

type VehicleRow = {
  id: string;
  owner_id: string;
  plate: string;
  model: string;
  year: number;
  color: string;
  renavam: string;
  photo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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
  };
}

export async function getVehiclesByOwner(ownerId: string): Promise<Vehicle[]> {
  const s = getSupabase();
  const { data, error } = await s
    .from('vehicles')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return (data as VehicleRow[]).map(mapVehicle);
}

export async function createVehicle(payload: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean }) {
  const s = getSupabase();
  const { data, error } = await s
    .from('vehicles')
    .insert({
      owner_id: payload.ownerId,
      plate: payload.plate,
      model: payload.model,
      year: payload.year,
      color: payload.color,
      renavam: payload.renavam,
      photo: payload.photo ?? null,
      is_active: payload.isActive ?? true,
    })
    .select('*')
    .single();
  if (error || !data) return { vehicle: null, error };
  return { vehicle: mapVehicle(data as VehicleRow), error: null };
}

export async function updateVehicle(id: string, changes: Partial<Omit<Vehicle, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>) {
  const s = getSupabase();
  const { data, error } = await s
    .from('vehicles')
    .update({
      plate: changes.plate,
      model: changes.model,
      year: changes.year,
      color: changes.color,
      renavam: changes.renavam,
      photo: changes.photo ?? null,
      is_active: changes.isActive,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return { vehicle: null, error };
  return { vehicle: mapVehicle(data as VehicleRow), error: null };
}

export async function deleteVehicle(id: string) {
  const s = getSupabase();
  const { error } = await s
    .from('vehicles')
    .delete()
    .eq('id', id);
  return { error };
}