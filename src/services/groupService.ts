import { getSupabase } from '../lib/supabaseClient';
import { Group, GroupMember } from '../types';

type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  group_members?: Array<{
    id: string;
    user_id: string;
    group_id: string;
    role: 'owner' | 'member';
    joined_at: string;
  }>;
  group_vehicles?: Array<{
    id: string;
    group_id: string;
    vehicle_id: string;
  }>;
};

function mapGroup(row: GroupRow): Group {
  const members: GroupMember[] = (row.group_members || []).map(m => ({
    id: m.id,
    userId: m.user_id,
    groupId: m.group_id,
    role: m.role,
    joinedAt: new Date(m.joined_at),
  }));
  const vehicleIds = (row.group_vehicles || []).map(gv => gv.vehicle_id);
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    ownerId: row.owner_id,
    members,
    vehicleIds,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function getGroupsByUser(_userId: string): Promise<Group[]> {
  // Nota: RLS limita seleção de grupos ao usuário membro; o parâmetro é ignorado.
  const s = getSupabase();
  const { data, error } = await s
    .from('groups')
    .select(`
      id, name, description, owner_id, created_at, updated_at,
      group_members ( id, user_id, group_id, role, joined_at ),
      group_vehicles ( id, group_id, vehicle_id )
    `)
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return (data as GroupRow[]).map(mapGroup);
}

export async function createGroup(ownerId: string, payload: { name: string; description?: string; vehicleIds?: string[] }) {
  const s = getSupabase();
  const { data, error } = await s
    .from('groups')
    .insert({
      name: payload.name,
      description: payload.description ?? null,
      owner_id: ownerId,
    })
    .select('*')
    .single();
  if (error || !data) return { group: null, error };
  const groupId = (data as GroupRow).id;
  // Adiciona owner como membro
  await s.from('group_members').insert({ user_id: ownerId, group_id: groupId, role: 'owner' });
  // Associa veículos
  const vehicleIds = payload.vehicleIds || [];
  if (vehicleIds.length) {
    await s.from('group_vehicles').insert(vehicleIds.map(vId => ({ group_id: groupId, vehicle_id: vId })));
  }
  // Retorna grupo com joins
  const { data: gdata } = await s
    .from('groups')
    .select(`
      id, name, description, owner_id, created_at, updated_at,
      group_members ( id, user_id, group_id, role, joined_at ),
      group_vehicles ( id, group_id, vehicle_id )
    `)
    .eq('id', groupId)
    .single();
  return { group: mapGroup(gdata as GroupRow), error: null };
}

export async function updateGroup(groupId: string, payload: { name?: string; description?: string; vehicleIds?: string[] }) {
  const s = getSupabase();
  const updates: any = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.description !== undefined) updates.description = payload.description ?? null;
  if (Object.keys(updates).length) {
    await s.from('groups').update(updates).eq('id', groupId);
  }
  if (payload.vehicleIds) {
    // Substitui associações de veículos
    await s.from('group_vehicles').delete().eq('group_id', groupId);
    if (payload.vehicleIds.length) {
      await s.from('group_vehicles').insert(payload.vehicleIds.map(vId => ({ group_id: groupId, vehicle_id: vId })));
    }
  }
  const { data } = await s
    .from('groups')
    .select(`
      id, name, description, owner_id, created_at, updated_at,
      group_members ( id, user_id, group_id, role, joined_at ),
      group_vehicles ( id, group_id, vehicle_id )
    `)
    .eq('id', groupId)
    .single();
  return { group: mapGroup(data as GroupRow), error: null };
}

export async function deleteGroup(groupId: string) {
  const s = getSupabase();
  const { error } = await s.from('groups').delete().eq('id', groupId);
  return { error };
}

export async function addMember(groupId: string, userId: string, role: 'owner' | 'member' = 'member') {
  const s = getSupabase();
  const { data, error } = await s
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId, role })
    .select('*')
    .single();
  if (error || !data) return { member: null, error };
  const m = data as { id: string; user_id: string; group_id: string; role: 'owner' | 'member'; joined_at: string };
  const member: GroupMember = { id: m.id, userId: m.user_id, groupId: m.group_id, role: m.role, joinedAt: new Date(m.joined_at) };
  return { member, error: null };
}

export async function removeMember(memberId: string) {
  const s = getSupabase();
  const { error } = await s.from('group_members').delete().eq('id', memberId);
  return { error };
}