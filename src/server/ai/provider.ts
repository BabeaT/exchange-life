import { serverEnv } from '@/server/config/env'
import { MockAiService } from './mock-provider'
import { OpenAiService } from './openai-provider'
import type { AiService } from './types'

export function createAiService(): AiService {
  if (serverEnv.AI_PROVIDER === 'openai') {
    return new OpenAiService()
  }

  return new MockAiService()
}
