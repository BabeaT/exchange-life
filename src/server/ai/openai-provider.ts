import OpenAI from 'openai'
import { assertOpenAIEnv, serverEnv } from '@/server/config/env'
import type {
  AiService,
  GenerateStorybookInput,
  GenerateStorybookOutput,
  OrganizeNarrativeInput,
  OrganizeNarrativeOutput,
  WritingGuideInput,
  WritingGuideOutput,
} from './types'

const jsonOnly = '只输出合法 JSON，不要 Markdown，不要解释。'

function parseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    throw new Error(`AI response is not valid JSON: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

export class OpenAiService implements AiService {
  private readonly client: OpenAI

  constructor() {
    assertOpenAIEnv()
    this.client = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY })
  }

  async guideWriting(input: WritingGuideInput): Promise<WritingGuideOutput> {
    const response = await this.client.responses.create({
      model: serverEnv.AI_TEXT_MODEL,
      instructions: [
        '你是“交换人生”的写作陪伴 AI，只帮助用户补全事实、分清感受与判断、温和表达情绪。',
        '不要替用户道歉、定罪、诊断对方心理，也不要把私人草稿发布给对方。',
        jsonOnly,
      ].join('\n'),
      input: JSON.stringify({
        task: 'writing-guide',
        outputSchema: {
          themes: ['string'],
          gentleQuestion: 'string',
          resumeHint: 'string',
          uncertainties: ['string'],
        },
        input,
      }),
    })

    return parseJson<WritingGuideOutput>(response.output_text)
  }

  async organizeNarrative(input: OrganizeNarrativeInput): Promise<OrganizeNarrativeOutput> {
    const response = await this.client.responses.create({
      model: serverEnv.AI_TEXT_MODEL,
      instructions: [
        '你是“交换人生”的叙事整理 AI。保留用户原意，把混乱表达整理成更客观、完整、可确认的叙事。',
        '必须保留不确定性，不编造日期、地点、动机或对方想法。',
        jsonOnly,
      ].join('\n'),
      input: JSON.stringify({
        task: 'organize-narrative',
        outputSchema: {
          titleSuggestion: 'string',
          organizedText: 'string',
          sections: [{ heading: 'string optional', text: 'string', sourceRefs: ['string'] }],
          uncertainties: ['string'],
        },
        input,
      }),
    })

    return parseJson<OrganizeNarrativeOutput>(response.output_text)
  }

  async generateStorybook(input: GenerateStorybookInput): Promise<GenerateStorybookOutput> {
    const response = await this.client.responses.create({
      model: serverEnv.AI_TEXT_MODEL,
      instructions: [
        '你是“交换人生”的记忆绘本编排 AI。只使用用户已确认并允许进入生成的文本。',
        '共同绘本需要同时尊重双方视角，不评判谁对谁错，不暴露未授权原始草稿。',
        '插图只生成安全的插图提示词，不描摹可识别真人面孔。',
        jsonOnly,
      ].join('\n'),
      input: JSON.stringify({
        task: 'generate-storybook',
        outputSchema: {
          title: 'string',
          synopsis: 'string',
          pages: [{ pageNo: 'number', text: 'string', illustrationPrompt: 'string' }],
          sourceAccessPolicy: 'hidden | after_storybook',
        },
        input,
      }),
    })

    return parseJson<GenerateStorybookOutput>(response.output_text)
  }
}
