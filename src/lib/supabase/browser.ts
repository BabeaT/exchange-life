'use client'

import { createBrowserClient } from '@supabase/ssr'
import { assertSupabasePublicEnv, publicEnv } from '@/lib/config/public-env'

export function createSupabaseBrowserClient() {
  assertSupabasePublicEnv()
  const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase browser env is missing.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
