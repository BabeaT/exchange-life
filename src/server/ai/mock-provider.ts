import type {
  AiService,
  GenerateStorybookInput,
  GenerateStorybookOutput,
  OrganizeNarrativeInput,
  OrganizeNarrativeOutput,
  WritingGuideInput,
  WritingGuideOutput,
} from './types'

const trimForTitle = (text: string) => text.trim().replace(/\s+/g, '').slice(0, 12)

export class MockAiService implements AiService {
  async guideWriting(input: WritingGuideInput): Promise<WritingGuideOutput> {
    const focus = input.selectedText || input.draftText

    return {
      themes: ['未说出口的感受', '同一件事里的不同位置'],
      gentleQuestion: focus.length > 20 ? '如果只补一句当时最真实的感受，你会补在哪里？' : '这件事发生前，你心里已经带着什么期待？',
      resumeHint: '可以先按时间顺序补齐“发生了什么”，再单独写“我当时怎么理解”。',
      uncertainties: ['时间、地点、对方当时的表达是否还需要确认'],
    }
  }

  async organizeNarrative(input: OrganizeNarrativeInput): Promise<OrganizeNarrativeOutput> {
    const title = input.contextTitle || trimForTitle(input.rawText) || '那一天的故事'
    const organizedText = input.rawText.trim()

    return {
      titleSuggestion: title,
      organizedText,
      sections: [
        {
          heading: '我记得的经过',
          text: organizedText || '这里会保留用户确认后的表达。',
          sourceRefs: ['draft:current'],
        },
      ],
      uncertainties: ['AI 只整理表达，不替用户确认事实。'],
    }
  }

  async generateStorybook(input: GenerateStorybookInput): Promise<GenerateStorybookOutput> {
    const sourceNames = input.sources.map(source => source.ownerLabel).join('和')
    const title = input.mode === 'joint' ? `${sourceNames}的共同记忆` : `${input.sources[0]?.ownerLabel ?? '我'}想告诉你的事`

    return {
      title,
      synopsis: input.mode === 'joint'
        ? '这本绘本把双方确认后的版本放在同一条温柔的时间线里。'
        : '这本绘本把单方确认后的经历整理成可以送达给对方的叙事。',
      sourceAccessPolicy: input.sourceAccessPolicy,
      pages: input.sources.map((source, index) => ({
        pageNo: index + 1,
        text: source.confirmedText.slice(0, 180) || `${source.ownerLabel}确认的故事会出现在这里。`,
        illustrationPrompt: `温柔绘本风格，表现${source.ownerLabel}记忆中的关键场景，不出现可识别真人面孔。`,
      })),
    }
  }
}
