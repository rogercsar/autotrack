import {
  getGroupsByUser as getGroupsByUserFromApi,
  createGroup as createGroupFromApi,
  updateGroup as updateGroupFromApi,
  deleteGroup as deleteGroupFromApi,
  addMember as addMemberFromApi,
  removeMember as removeMemberFromApi,
} from '../api/group'
import { Group, GroupMember } from '../types'

type GroupRow = {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
  members?: Array<{
    id: string
    user_id: string
    group_id: string
    role: 'owner' | 'member'
    joined_at: string
  }>
  vehicles?: Array<{
    id: string
    group_id: string
    vehicle_id: string
  }>
}

function mapGroup(row: GroupRow): Group {
  const members: GroupMember[] = (row.members || []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    groupId: m.group_id,
    role: m.role,
    joinedAt: new Date(m.joined_at),
  }))
  const vehicleIds = (row.vehicles || []).map((gv) => gv.vehicle_id)
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    ownerId: row.owner_id,
    members,
    vehicleIds,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export async function getGroupsByUser(userId: string): Promise<Group[]> {
  const { data, error } = await getGroupsByUserFromApi(userId)
  if (error || !data) return []
  return (data as GroupRow[]).map(mapGroup)
}

export async function createGroup(
  ownerId: string,
  payload: { name: string; description?: string; vehicleIds?: string[] }
) {
  const { group, error } = await createGroupFromApi(ownerId, payload)
  if (error || !group) return { group: null, error }
  return { group: mapGroup(group as GroupRow), error: null }
}

export async function updateGroup(
  groupId: string,
  payload: { name?: string; description?: string; vehicleIds?: string[] }
) {
  const { group, error } = await updateGroupFromApi(groupId, payload)
  if (error || !group) return { group: null, error }
  return { group: mapGroup(group as GroupRow), error: null }
}

export async function deleteGroup(groupId: string) {
  return await deleteGroupFromApi(groupId)
}

export async function addMember(
  groupId: string,
  userId: string,
  role: 'owner' | 'member' = 'member'
) {
  const { member, error } = await addMemberFromApi(groupId, userId, role)
  if (error || !member) return { member: null, error }
  const m = member as {
    id: string
    user_id: string
    group_id: string
    role: 'owner' | 'member'
    joined_at: string
  }
  const result: GroupMember = {
    id: m.id,
    userId: m.user_id,
    groupId: m.group_id,
    role: m.role,
    joinedAt: new Date(m.joined_at),
  }
  return { member: result, error: null }
}

export async function removeMember(memberId: string) {
  return await removeMemberFromApi(memberId)
}
