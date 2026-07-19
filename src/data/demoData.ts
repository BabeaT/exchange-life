import type { DemoState, Exchange, StoryDraft, UserId } from '../types'

export const reactions = [
  { id: 'received', icon: '◡', label: '我收到了' },
  { id: 'listening', icon: '··', label: '我在听' },
  { id: 'hug', icon: '⌒', label: '轻轻抱住' },
  { id: 'thinking', icon: '…', label: '我想再想一想' },
  { id: 'thanks', icon: '✦', label: '谢谢你告诉我' },
]

export const themes = [
  '最近很想告诉你的事',
  '一段一直记得的经历',
  '某个改变了我的时刻',
  '一种没有说出口的感受',
  '我想让你认识的那部分自己',
]

export const sampleTexts: Record<UserId, string> = {
  'user-a': '我一直记得那个冬至。厨房的玻璃蒙着水汽，你在桌边一只一只地摆碗。我那时忙着收拾行李，以为自己没有回头。后来才发现，我记住的不是离开，而是门口那盏一直亮着的灯。具体是哪一年，我已经记不太清了。',
  'user-b': '那天我其实很早就开始准备晚饭。你说晚上要赶车，我怕耽误你，所以一直没有问能不能多留一会儿。我记得你在门口系围巾的时候笑了一下。你走后，我把多盛的那碗汤放在窗边，等它慢慢凉下来。',
}

export const organizedTexts: Record<UserId, string> = {
  'user-a': '我一直记得那个冬至。厨房的玻璃蒙着水汽，你在桌边一只一只地摆碗。那时我忙着收拾行李，以为自己没有回头。后来才明白，我记住的不是离开，而是门口那盏一直亮着的灯。具体是哪一年，我已经记不太清了。',
  'user-b': '那天，我很早就开始准备晚饭。你说晚上要赶车，我怕耽误你，所以一直没有问能不能多留一会儿。我记得你在门口系围巾时笑了一下。你走后，我把多盛的那碗汤放在窗边，等它慢慢凉下来。',
}

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
  id: 'exchange-winter-001',
  title: '那个冬至的晚饭',
  code: 'WINTER26',
  narrativeType: 'shared-event',
  method: 'independent',
  deliveryMode: 'immediate',
  scheduledAt: '',
  joined: false,
  context: {
    title: '那个冬至的晚饭',
    time: '很多年前的冬至前后',
    place: '家里的厨房和门口',
    people: '丹青、林夏和家人',
    clue: '一顿没来得及好好吃完的晚饭，门口亮着一盏灯。',
    reason: '想重新看看，那天我们各自记住了什么。',
    theme: '一段一直记得的经历',
  },
  drafts: { 'user-a': makeDraft('user-a'), 'user-b': makeDraft('user-b') },
  letters: [],
  intersectionStatus: 'ineligible',
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
  toast: '',
})

export const makeCompleteState = (): DemoState => {
  const state = makeInitialState()
  state.authenticated = true
  state.exchange.joined = true
  state.exchange.drafts['user-a'] = { ...makeDraft('user-a'), rawText: sampleTexts['user-a'], organizedText: organizedTexts['user-a'], phase: 'confirmed', confirmed: true, savedAt: '刚刚' }
  state.exchange.drafts['user-b'] = { ...makeDraft('user-b'), rawText: sampleTexts['user-b'], organizedText: organizedTexts['user-b'], phase: 'confirmed', confirmed: true, savedAt: '刚刚' }
  state.exchange.letters = [
    { id: 'letter-a', senderId: 'user-a', recipientId: 'user-b', title: '门口那盏灯', text: organizedTexts['user-a'], layout: 'balanced', illustration: 0, status: 'read', sentAt: '2026-07-19T10:00:00Z', deliveredAt: '2026-07-19T10:05:00Z', readAt: '2026-07-19T10:10:00Z', reaction: '我收到了' },
    { id: 'letter-b', senderId: 'user-b', recipientId: 'user-a', title: '窗边那碗汤', text: organizedTexts['user-b'], layout: 'balanced', illustration: 1, status: 'read', sentAt: '2026-07-19T10:03:00Z', deliveredAt: '2026-07-19T10:05:00Z', readAt: '2026-07-19T10:12:00Z', reaction: '轻轻抱住' },
  ]
  state.exchange.intersectionStatus = 'complete'
  state.exchange.intersectionSaved = true
  state.exchange.wateredBy = ['user-a']
  return state
}
