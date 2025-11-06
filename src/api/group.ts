import { getSupabase } from '../lib/supabaseClient'
import { Group } from '../types'

export const getGroupsByUser = async (userId: string) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('groups')
    .select('*, members:group_members(*)')
    .or(`ownerId.eq.${userId},members.userId.eq.${userId}`)
  if (error) throw error
  return data
}

export const createGroup = async (
  ownerId: string,
  groupData: Partial<Group>
) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('groups')
    .insert({ ...groupData, ownerId })
    .select('*, members:group_members(*)')
  if (error) throw error
  return { group: data?.[0], error }
}

export const updateGroup = async (
  groupId: string,
  groupData: Partial<Group>
) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('groups')
    .update(groupData)
    .eq('id', groupId)
    .select('*, members:group_members(*)')
  if (error) throw error
  return { group: data?.[0], error }
}

export const deleteGroup = async (groupId: string) => {
  const s = getSupabase()
  const { error } = await s.from('groups').delete().eq('id', groupId)
  return { error }
}

export const addMember = async (
  groupId: string,
  userId: string,
  role: 'owner' | 'member'
) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('group_members')
    .insert({ groupId, userId, role })
    .select()
  if (error) throw error
  return { member: data?.[0], error }
}

export const removeMember = async (memberId: string) => {
  const s = getSupabase()
  const { error } = await s.from('group_members').delete().eq('id', memberId)
  return { error }
}
