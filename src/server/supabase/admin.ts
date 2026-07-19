import { createClient } from '@supabase/supabase-js'
import { publicEnv } from '@/lib/config/public-env'
import { assertSupabaseAdminEnv, serverEnv } from '@/server/config/env'

export function createSupabaseAdminClient() {
  assertSupabaseAdminEnv()
  const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for the admin Supabase client.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
