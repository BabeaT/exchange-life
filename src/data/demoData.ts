import type { DemoState, Exchange, StoryDraft, UserId } from '../types'
import { modeAStory } from './modeAStory'

export const reactions = [
  { id: 'seen', icon: '◌', label: '我看见了' },
  { id: 'closer', icon: '⌒', label: '轻轻靠近' },
  { id: 'arrived', icon: '✦', label: '这句话抵达我了' },
]

export const themes = [
  '最近很想告诉你的事',
  '一段一直记得的经历',
  '某个改变了我的时刻',
  '一种没有说出口的感受',
  '我想让你认识的那部分自己',
]

export const sampleTexts: Record<UserId, string> = modeAStory.raw

export const organizedTexts: Record<UserId, string> = modeAStory.organized

export const makeDraft = (ownerId: UserId): StoryDraft => ({
  ownerId,
  rawText: '',
  organizedText: '',
  phase: 'editing',
  savedAt: '',
  media: [],
  aiError: false,
  confirmed: false,
})

export const makeExchange = (): Exchange => ({
  id: 'exchange-leaving-home-001',
  title: modeAStory.title,
  code: 'LEAVE24',
  narrativeType: 'shared-event',
  method: 'independent',
  deliveryMode: 'immediate',
  scheduledAt: '',
  joined: false,
  context: {
    title: modeAStory.title,
    time: '2024年8月中下旬',
    place: '家里的餐桌；林夏的卧室；去机场的出租车；航站楼安检口；离家后的两个城市',
    people: '林夏、丹青',
    range: '从林夏收到深圳工作录用通知，到她离家后的第一个星期。',
    clue: '晚饭时宣布工作决定；关于天气、租房、安全和工作的反复询问；收拾行李；药品、衣服、腊肉和小时候喜欢的零食；去机场的出租车；黄色等候线外的送别；飞机起飞；离开后没有发出的消息。',
    reason: '离开之前，我们说了很多，却没有真正说出自己在害怕什么。',
    theme: '共同事件交换',
  },
  drafts: { 'user-a': makeDraft('user-a'), 'user-b': makeDraft('user-b') },
  letters: [],
  intersectionStatus: 'ineligible',
  memoryCreated: false,
  intersectionSaved: false,
  wateredBy: [],
  createdAt: new Date().toISOString(),
})

export const makeInitialState = (): DemoState => ({
  activeUserId: 'user-a',
  authenticated: false,
  users: {
    'user-a': { id: 'user-a', name: '丹青', avatar: '丹', messenger: 'moss', profileComplete: true },
    'user-b': { id: 'user-b', name: '林夏', avatar: '林', messenger: 'cloud', profileComplete: true },
  },
  exchange: makeExchange(),
  settings: { reducedMotion: false, narrationVoice: 'warm', narrationSpeed: 1 },
  personalization: {
    stationeryColor: 'ivory',
    stationeryTexture: 'clean',
    messengerType: 'moss',
    messengerColor: 'sage',
    messengerTestAnswers: [],
    messengerTestCompleted: false,
    personalizationUpdatedAt: '',
  },
  toast: '',
})

export const makeCompleteState = (): DemoState => {
  const state = makeInitialState()
  state.authenticated = true
  state.exchange.joined = true
  state.exchange.drafts['user-a'] = { ...makeDraft('user-a'), rawText: sampleTexts['user-a'], organizedText: organizedTexts['user-a'], phase: 'confirmed', confirmed: true, savedAt: '刚刚' }
  state.exchange.drafts['user-b'] = { ...makeDraft('user-b'), rawText: sampleTexts['user-b'], organizedText: organizedTexts['user-b'], phase: 'confirmed', confirmed: true, savedAt: '刚刚' }
  state.exchange.letters = [
    { id: 'letter-a', senderId: 'user-a', recipientId: 'user-b', title: modeAStory.letterTitles['user-a'], text: organizedTexts['user-a'], layout: 'balanced', illustration: 2, status: 'read', sentAt: '2026-07-19T10:00:00Z', deliveredAt: '2026-07-19T10:05:00Z', readAt: '2026-07-19T10:10:00Z', reaction: '我看见了' },
    { id: 'letter-b', senderId: 'user-b', recipientId: 'user-a', title: modeAStory.letterTitles['user-b'], text: organizedTexts['user-b'], layout: 'balanced', illustration: 3, status: 'read', sentAt: '2026-07-19T10:03:00Z', deliveredAt: '2026-07-19T10:05:00Z', readAt: '2026-07-19T10:12:00Z', reaction: '轻轻靠近' },
  ]
  state.exchange.intersectionStatus = 'complete'
  state.exchange.memoryCreated = true
  state.exchange.intersectionSaved = true
  state.exchange.wateredBy = ['user-a']
  return state
}
