import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  console.warn('Supabase: REACT_APP_SUPABASE_URL/REACT_APP_SUPABASE_ANON_KEY não configurados.');
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error('Supabase não configurado. Defina REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY.');
  }
  return client;
}

export async function pingSupabase() {
  try {
    const s = getSupabase();
    const { error } = await s.from('profiles').select('id').limit(1);
    return { ok: !error, error };
  } catch (err) {
    return { ok: false, error: err };
  }
}