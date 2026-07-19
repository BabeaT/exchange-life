import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAiService } from '@/server/ai/provider'

const requestSchema = z.object({
  requestId: z.string().optional(),
  exchangeId: z.string().min(1),
  locale: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
  draftText: z.string().min(1),
  selectedText: z.string().optional(),
  requestedAction: z.enum(['review', 'organize', 'gentle_prompt']),
})

export async function POST(request: Request) {
  const payload = requestSchema.parse(await request.json())
  const result = await createAiService().guideWriting(payload)

  return NextResponse.json({
    schemaVersion: '1.0',
    requestId: payload.requestId,
    status: 'success',
    data: result,
  })
}
