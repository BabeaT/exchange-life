export type AiCapability =
  | 'writing-guide'
  | 'organize-narrative'
  | 'generate-storybook'

export interface AiRequestBase {
  requestId?: string
  exchangeId: string
  locale?: 'zh-CN' | 'en-US'
}

export interface WritingGuideInput extends AiRequestBase {
  draftText: string
  selectedText?: string
  requestedAction: 'review' | 'organize' | 'gentle_prompt'
}

export interface WritingGuideOutput {
  themes: string[]
  gentleQuestion: string
  resumeHint: string
  uncertainties: string[]
}

export interface OrganizeNarrativeInput extends AiRequestBase {
  contextTitle?: string
  rawText: string
  toneConstraint?: 'preserve' | 'gentle' | 'storybook'
}

export interface OrganizeNarrativeOutput {
  titleSuggestion: string
  organizedText: string
  sections: Array<{ heading?: string; text: string; sourceRefs: string[] }>
  uncertainties: string[]
}

export interface GenerateStorybookInput extends AiRequestBase {
  mode: 'single' | 'joint'
  narrativeType: 'shared_event' | 'life_period'
  sourceAccessPolicy: 'hidden' | 'after_storybook'
  sources: Array<{ ownerLabel: string; confirmedText: string }>
}

export interface StorybookPage {
  pageNo: number
  text: string
  illustrationPrompt: string
}

export interface GenerateStorybookOutput {
  title: string
  synopsis: string
  pages: StorybookPage[]
  sourceAccessPolicy: 'hidden' | 'after_storybook'
}

export interface AiService {
  guideWriting(input: WritingGuideInput): Promise<WritingGuideOutput>
  organizeNarrative(input: OrganizeNarrativeInput): Promise<OrganizeNarrativeOutput>
  generateStorybook(input: GenerateStorybookInput): Promise<GenerateStorybookOutput>
}
