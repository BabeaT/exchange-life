import { NextResponse } from 'next/server'
import { publicEnv } from '@/lib/config/public-env'
import { serverEnv } from '@/server/config/env'

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: 'exchange-life',
    supabaseConfigured: Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    aiProvider: serverEnv.AI_PROVIDER,
  })
}
