import { getSupabase } from '../lib/supabaseClient'
import { Company } from '../types'

type CompanyRow = {
  id: string
  name: string
  type: 'workshop' | 'dealership' | 'other'
  description: string | null
  logo: string | null
  phone: string | null
  email: string | null
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  latitude: number | null
  longitude: number | null
  services: string[] | null
  rating: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

function mapCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    type:
      row.type === 'workshop' || row.type === 'dealership'
        ? row.type
        : 'workshop',
    description: row.description || '',
    logo: row.logo || undefined,
    phone: row.phone || '',
    email: row.email || '',
    address: {
      street: row.street || '',
      number: row.number || '',
      neighborhood: row.neighborhood || '',
      city: row.city || '',
      state: row.state || '',
      zipCode: row.zip_code || '',
      latitude: row.latitude ?? 0,
      longitude: row.longitude ?? 0,
    },
    services: row.services || [],
    rating: row.rating ?? 0,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export async function getCompanies() {
  const s = getSupabase()
  const { data, error } = await s
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false })
  if (error || !data) return []
  return (data as CompanyRow[]).map(mapCompany)
}

export async function getCompanyById(id: string) {
  const s = getSupabase()
  const { data, error } = await s
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return mapCompany(data as CompanyRow)
}

export async function searchCompanies(term: string) {
  const s = getSupabase()
  const ilike = `%${term}%`
  const { data, error } = await s
    .from('companies')
    .select('*')
    .or(
      [
        `name.ilike.${ilike}`,
        `description.ilike.${ilike}`,
        `city.ilike.${ilike}`,
        `state.ilike.${ilike}`,
        `services::text.ilike.${ilike}`,
      ].join(',')
    )
    .eq('is_active', true)
    .order('rating', { ascending: false })
  if (error || !data) return []
  return (data as CompanyRow[]).map(mapCompany)
}
