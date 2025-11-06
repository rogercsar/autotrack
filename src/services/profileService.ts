import {
  getProfileById as getProfileByIdFromApi,
  getProfileByEmail as getProfileByEmailFromApi,
  updateUserType as updateUserTypeFromApi,
} from '../api/profile'
import { User, UserType } from '../types'

type ProfileRow = {
  id: string
  name: string
  email: string
  user_type: 'basic' | 'advanced' | 'pro' | 'admin'
  avatar: string | null
  phone: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

const toUser = (row: ProfileRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  userType: row.user_type as UserType,
  avatar: row.avatar || undefined,
  phone: row.phone || undefined,
  emergencyContact: row.emergency_contact || undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

export async function getProfileById(id: string): Promise<User | null> {
  const { data, error } = await getProfileByIdFromApi(id)
  if (error || !data) return null
  return toUser(data as ProfileRow)
}

export async function updateUserType(id: string, userType: UserType) {
  return await updateUserTypeFromApi(id, userType)
}

export async function getProfileByEmail(email: string): Promise<User | null> {
  const { data, error } = await getProfileByEmailFromApi(email)
  if (error || !data) return null
  return toUser(data as ProfileRow)
}
