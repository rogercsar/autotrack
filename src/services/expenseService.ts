import { getSupabase } from '../lib/supabaseClient';
import { Expense, ExpenseType } from '../types';

type ExpenseRow = {
  id: string;
  vehicle_id: string;
  type: 'fuel' | 'ticket' | 'maintenance' | 'insurance' | 'ipva' | 'licensing' | 'other';
  description: string;
  amount: string;
  date: string;
  location: string | null;
  receipt: string | null;
  created_at: string;
  updated_at: string;
};

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    type: row.type as ExpenseType,
    description: row.description,
    amount: Number(row.amount),
    date: new Date(row.date),
    location: row.location || undefined,
    receipt: row.receipt || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function getExpensesByVehicle(vehicleId: string): Promise<Expense[]> {
  const s = getSupabase();
  const { data, error } = await s
    .from('expenses')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('date', { ascending: false });
  if (error || !data) return [];
  return (data as ExpenseRow[]).map(mapExpense);
}

export async function createExpense(payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
  const s = getSupabase();
  const { data, error } = await s
    .from('expenses')
    .insert({
      vehicle_id: payload.vehicleId,
      type: payload.type,
      description: payload.description,
      amount: payload.amount,
      date: payload.date.toISOString().slice(0, 10),
      location: payload.location ?? null,
      receipt: payload.receipt ?? null,
    })
    .select('*')
    .single();
  if (error || !data) return { expense: null, error };
  return { expense: mapExpense(data as ExpenseRow), error: null };
}

export async function updateExpense(id: string, changes: Partial<Omit<Expense, 'id' | 'vehicleId' | 'createdAt' | 'updatedAt'>>) {
  const body: any = {};
  if (changes.type) body.type = changes.type;
  if (changes.description) body.description = changes.description;
  if (typeof changes.amount === 'number') body.amount = changes.amount;
  if (changes.date) body.date = changes.date.toISOString().slice(0, 10);
  if (typeof changes.location !== 'undefined') body.location = changes.location ?? null;
  if (typeof changes.receipt !== 'undefined') body.receipt = changes.receipt ?? null;

  const s = getSupabase();
  const { data, error } = await s
    .from('expenses')
    .update(body)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return { expense: null, error };
  return { expense: mapExpense(data as ExpenseRow), error: null };
}

export async function deleteExpense(id: string) {
  const s = getSupabase();
  const { error } = await s
    .from('expenses')
    .delete()
    .eq('id', id);
  return { error };
}

export async function getExpensesByVehicleIds(vehicleIds: string[]): Promise<Expense[]> {
  if (!vehicleIds.length) return [];
  const s = getSupabase();
  const { data, error } = await s
    .from('expenses')
    .select('*')
    .in('vehicle_id', vehicleIds)
    .order('date', { ascending: false });
  if (error || !data) return [];
  return (data as ExpenseRow[]).map(mapExpense);
}

export async function uploadExpenseReceipt(userId: string, file: File): Promise<{ url: string | null; error: any }>{
  const s = getSupabase();
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${userId}/expense-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await s.storage.from('receipts').upload(path, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: pub } = s.storage.from('receipts').getPublicUrl(path);
  return { url: pub.publicUrl, error: null };
}