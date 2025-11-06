import {
  getExpensesByVehicleIds as getExpensesByVehicleIdsFromApi,
  createExpense as createExpenseFromApi,
  updateExpense as updateExpenseFromApi,
  deleteExpense as deleteExpenseFromApi,
  uploadExpenseReceipt as uploadExpenseReceiptFromApi,
} from '../api/expense'
import { Expense, ExpenseType } from '../types'

type ExpenseRow = {
  id: string
  vehicle_id: string
  type:
    | 'fuel'
    | 'ticket'
    | 'maintenance'
    | 'insurance'
    | 'ipva'
    | 'licensing'
    | 'other'
  description: string
  amount: string
  date: string
  location: string | null
  receipt: string | null
  created_at: string
  updated_at: string
}

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
  }
}

export async function getExpensesByVehicleIds(
  vehicleIds: string[]
): Promise<Expense[]> {
  const data = await getExpensesByVehicleIdsFromApi(vehicleIds)
  if (!data) return []
  return (data as ExpenseRow[]).map(mapExpense)
}

export async function createExpense(
  payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>
) {
  const { expense, error } = await createExpenseFromApi(payload)
  if (error || !expense) return { expense: null, error }
  return { expense: mapExpense(expense as ExpenseRow), error: null }
}

export async function updateExpense(
  id: string,
  changes: Partial<
    Omit<Expense, 'id' | 'vehicleId' | 'createdAt' | 'updatedAt'>
  >
) {
  const { expense, error } = await updateExpenseFromApi(id, changes)
  if (error || !expense) return { expense: null, error }
  return { expense: mapExpense(expense as ExpenseRow), error: null }
}

export async function deleteExpense(id: string) {
  return await deleteExpenseFromApi(id)
}

export async function uploadExpenseReceipt(userId: string, file: File) {
  return await uploadExpenseReceiptFromApi(userId, file)
}
