import { getSupabase } from '../lib/supabaseClient'
import { Expense } from '../types'

export const getExpensesByVehicleIds = async (vehicleIds: string[]) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('expenses')
    .select('*')
    .in('vehicleId', vehicleIds)
  if (error) throw error
  return data
}

export const createExpense = async (expenseData: Partial<Expense>) => {
  const s = getSupabase()
  const { data, error } = await s.from('expenses').insert(expenseData).select()
  if (error) throw error
  return { expense: data?.[0], error }
}

export const updateExpense = async (
  expenseId: string,
  expenseData: Partial<Expense>
) => {
  const s = getSupabase()
  const { data, error } = await s
    .from('expenses')
    .update(expenseData)
    .eq('id', expenseId)
    .select()
  if (error) throw error
  return { expense: data?.[0], error }
}

export const deleteExpense = async (expenseId: string) => {
  const s = getSupabase()
  const { error } = await s.from('expenses').delete().eq('id', expenseId)
  return { error }
}

export const uploadExpenseReceipt = async (userId: string, file: File) => {
  const s = getSupabase()
  const fileName = `${userId}/${Date.now()}-${file.name}`
  const { data, error } = await s.storage
    .from('receipts')
    .upload(fileName, file)

  if (error) {
    return { url: null, error }
  }

  const { data: publicUrlData } = s.storage
    .from('receipts')
    .getPublicUrl(data.path)

  return { url: publicUrlData.publicUrl, error: null }
}
