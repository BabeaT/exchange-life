import { z } from 'zod'
import { publicEnv, publicEnvSchema, assertSupabasePublicEnv } from '@/lib/config/public-env'

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  AI_PROVIDER: z.enum(['openai', 'mock']).default('mock'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  AI_TEXT_MODEL: z.string().min(1).default('gpt-4.1-mini'),
  AI_IMAGE_MODEL: z.string().min(1).default('gpt-image-1'),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  DATABASE_URL: z.string().min(1).optional(),
})

export const serverEnv = serverEnvSchema.parse({
  ...publicEnv,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AI_PROVIDER: process.env.AI_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  AI_TEXT_MODEL: process.env.AI_TEXT_MODEL,
  AI_IMAGE_MODEL: process.env.AI_IMAGE_MODEL,
  SIGNED_URL_TTL_SECONDS: process.env.SIGNED_URL_TTL_SECONDS,
  DATABASE_URL: process.env.DATABASE_URL,
})

export function assertSupabaseAdminEnv() {
  assertSupabasePublicEnv()
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin env is missing. Set SUPABASE_SERVICE_ROLE_KEY on the server only.')
  }
}

export function assertOpenAIEnv() {
  if (serverEnv.AI_PROVIDER === 'openai' && !serverEnv.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai.')
  }
}
