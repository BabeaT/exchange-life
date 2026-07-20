export type UserId = 'user-a' | 'user-b'
export type NarrativeType = 'shared-event' | 'life-fragment'
export type ExchangeMethod = 'independent' | 'tell-first'
export type DeliveryMode = 'immediate' | 'scheduled'
export type DraftPhase = 'editing' | 'organizing' | 'confirming' | 'confirmed'
export type LetterStatus = 'draft' | 'held' | 'scheduled' | 'delivered' | 'read'

export interface DemoUser {
  id: UserId
  name: string
  avatar: string
  messenger: 'moss' | 'cloud' | 'ember' | 'pebble'
  profileComplete: boolean
}

export interface StoryContext {
  title: string
  time: string
  place: string
  people: string
  range: string
  clue: string
  reason: string
  theme: string
}

export interface StoryMedia {
  id: string
  kind: 'image' | 'audio'
  name: string
  preview?: string
  duration?: number
  transcript?: string
}

export interface StoryDraft {
  ownerId: UserId
  rawText: string
  organizedText: string
  phase: DraftPhase
  savedAt: string
  media: StoryMedia[]
  aiError: boolean
  confirmed: boolean
}

export interface Letter {
  id: string
  senderId: UserId
  recipientId: UserId
  text: string
  title: string
  layout: 'text' | 'balanced' | 'image'
  illustration: number
  status: LetterStatus
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  reaction?: string
  isReply?: boolean
}

export interface Exchange {
  id: string
  title: string
  code: string
  narrativeType: NarrativeType
  method: ExchangeMethod
  deliveryMode: DeliveryMode
  scheduledAt: string
  joined: boolean
  context: StoryContext
  drafts: Record<UserId, StoryDraft>
  letters: Letter[]
  intersectionStatus: 'ineligible' | 'ready' | 'loading' | 'error' | 'complete'
  memoryCreated: boolean
  intersectionSaved: boolean
  wateredBy: UserId[]
  createdAt: string
}

export interface DemoSettings {
  reducedMotion: boolean
  narrationVoice: 'warm' | 'female' | 'male'
  narrationSpeed: number
}

export interface DemoPersonalization {
  stationeryColor: 'ivory' | 'mist-blue' | 'dusty-pink' | 'soft-purple' | 'sage' | 'ochre' | 'light-brown'
  stationeryTexture: 'clean' | 'fiber' | 'mist' | 'vintage' | 'warm-grain'
  messengerType: DemoUser['messenger']
  messengerColor: 'sage' | 'mist-blue' | 'dusty-pink' | 'soft-purple' | 'ochre'
  messengerTestAnswers: string[]
  messengerTestCompleted: boolean
  personalizationUpdatedAt: string
}

export interface DemoState {
  activeUserId: UserId
  authenticated: boolean
  users: Record<UserId, DemoUser>
  exchange: Exchange
  settings: DemoSettings
  personalization: DemoPersonalization
  toast: string
}
