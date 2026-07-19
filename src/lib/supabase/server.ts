import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { assertSupabasePublicEnv, publicEnv } from '@/lib/config/public-env'

export async function createSupabaseServerClient() {
  assertSupabasePublicEnv()
  const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookieStore = await cookies()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase server env is missing.')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Server Components cannot set cookies. Middleware or Route Handlers will refresh them.
          }
        },
      },
    },
  )
}
