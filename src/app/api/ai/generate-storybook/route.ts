import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAiService } from '@/server/ai/provider'

const requestSchema = z.object({
  requestId: z.string().optional(),
  exchangeId: z.string().min(1),
  locale: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
  mode: z.enum(['single', 'joint']),
  narrativeType: z.enum(['shared_event', 'life_period']),
  sourceAccessPolicy: z.enum(['hidden', 'after_storybook']),
  sources: z.array(z.object({
    ownerLabel: z.string().min(1),
    confirmedText: z.string().min(1),
  })).min(1).max(2),
})

export async function POST(request: Request) {
  const payload = requestSchema.parse(await request.json())

  if (payload.mode === 'joint' && payload.sources.length !== 2) {
    return NextResponse.json(
      { schemaVersion: '1.0', requestId: payload.requestId, status: 'error', error: { code: 'JOINT_REQUIRES_TWO_SOURCES' } },
      { status: 400 },
    )
  }

  const result = await createAiService().generateStorybook(payload)

  return NextResponse.json({
    schemaVersion: '1.0',
    requestId: payload.requestId,
    status: 'success',
    data: result,
  })
}
