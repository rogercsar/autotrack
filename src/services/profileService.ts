import { getSupabase } from '../lib/supabaseClient';
import { User, UserType } from '../types';

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  user_type: 'basic' | 'advanced' | 'pro' | 'admin';
  avatar: string | null;
  phone: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
};

export async function getProfileById(id: string): Promise<User | null> {
  const s = getSupabase();
  const { data, error } = await s
    .from('profiles')
    .select('*')
    .eq('id', id)
    .limit(1)
    .maybeSingle();

  if (error) return null;
  if (!data) return null;
  const row = data as ProfileRow;
  const user: User = {
    id: row.id,
    name: row.name,
    email: row.email,
    userType: row.user_type as UserType,
    avatar: row.avatar || undefined,
    phone: row.phone || undefined,
    emergencyContact: row.emergency_contact || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
  return user;
}

export async function updateUserType(id: string, userType: UserType) {
  const s = getSupabase();
  const { error } = await s
    .from('profiles')
    .update({ user_type: userType })
    .eq('id', id);
  return { error };
}

export async function getProfileByEmail(email: string): Promise<User | null> {
  const s = getSupabase();
  const { data, error } = await s
    .from('profiles')
    .select('*')
    .eq('email', email)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as ProfileRow;
  const user: User = {
    id: row.id,
    name: row.name,
    email: row.email,
    userType: row.user_type as UserType,
    avatar: row.avatar || undefined,
    phone: row.phone || undefined,
    emergencyContact: row.emergency_contact || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
  return user;
}