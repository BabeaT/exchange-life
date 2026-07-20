import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { makeCompleteState, makeDraft, makeInitialState, organizedTexts, sampleTexts } from '../data/demoData'
import { modeAStory } from '../data/modeAStory'
import type { DemoPersonalization, DemoState, Exchange, Letter, StoryContext, StoryMedia, UserId } from '../types'

const STORAGE_KEY = 'exchange-life-demo-v1'

interface DemoActions {
  setActiveUser: (id: UserId) => void
  login: () => void
  logout: () => void
  updateProfile: (name: string, avatar: string) => void
  updatePersonalization: (patch: Partial<DemoPersonalization>) => void
  updateExchange: (patch: Partial<Exchange>) => void
  updateContext: (patch: Partial<StoryContext>) => void
  updateDraft: (userId: UserId, patch: Partial<DemoState['exchange']['drafts'][UserId]>) => void
  addMedia: (media: StoryMedia) => void
  removeMedia: (id: string) => void
  organizeDraft: (fail?: boolean) => void
  confirmDraft: (text: string) => void
  sendLetter: (letter: Omit<Letter, 'id' | 'senderId' | 'recipientId' | 'status'>) => void
  deliverLetters: () => void
  markRead: (letterId: string) => void
  reactToLetter: (letterId: string, reaction: string) => void
  setIntersection: (status: Exchange['intersectionStatus']) => void
  createMemoryFragment: () => void
  saveMemoryToTree: () => void
  water: () => void
  loadSample: () => void
  reset: () => void
  seedBothDrafts: () => void
  seedBothLetters: () => void
  toast: (message: string) => void
}

const DemoContext = createContext<{ state: DemoState; actions: DemoActions } | null>(null)

const loadState = () => {
  if (typeof window === 'undefined') return makeInitialState()

  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return makeInitialState()
    const saved = JSON.parse(value) as DemoState
    if (saved.exchange.id === 'exchange-winter-001') saved.exchange = makeInitialState().exchange
    saved.exchange.memoryCreated ??= saved.exchange.intersectionSaved
    saved.exchange.context.range ??= makeInitialState().exchange.context.range
    saved.personalization ??= makeInitialState().personalization
    return saved
  } catch {
    return makeInitialState()
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const mutate = (fn: (current: DemoState) => DemoState) => setState(current => fn(structuredClone(current)))
  const notify = (message: string) => {
    setState(current => ({ ...current, toast: message }))
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setState(current => ({ ...current, toast: '' })), 2400)
    }
  }

  const actions = useMemo<DemoActions>(() => ({
    setActiveUser: id => mutate(next => ({ ...next, activeUserId: id, authenticated: true })),
    login: () => mutate(next => ({ ...next, authenticated: true })),
    logout: () => mutate(next => ({ ...next, authenticated: false })),
    updateProfile: (name, avatar) => mutate(next => {
      next.users[next.activeUserId] = { ...next.users[next.activeUserId], name, avatar, profileComplete: true }
      return next
    }),
    updateExchange: patch => mutate(next => ({ ...next, exchange: { ...next.exchange, ...patch } })),
    updateContext: patch => mutate(next => ({ ...next, exchange: { ...next.exchange, context: { ...next.exchange.context, ...patch } } })),
    updateDraft: (userId, patch) => mutate(next => {
      next.exchange.drafts[userId] = { ...next.exchange.drafts[userId], ...patch, savedAt: '刚刚' }
      return next
    }),
    addMedia: media => mutate(next => {
      next.exchange.drafts[next.activeUserId].media.push(media)
      next.exchange.drafts[next.activeUserId].savedAt = '刚刚'
      return next
    }),
    removeMedia: id => mutate(next => {
      next.exchange.drafts[next.activeUserId].media = next.exchange.drafts[next.activeUserId].media.filter(item => item.id !== id)
      return next
    }),
    organizeDraft: fail => mutate(next => {
      const draft = next.exchange.drafts[next.activeUserId]
      draft.phase = fail ? 'editing' : 'confirming'
      draft.aiError = Boolean(fail)
      draft.organizedText = fail ? draft.organizedText : organizedTexts[next.activeUserId]
      return next
    }),
    confirmDraft: text => mutate(next => {
      const draft = next.exchange.drafts[next.activeUserId]
      draft.organizedText = text
      draft.phase = 'confirmed'
      draft.confirmed = true
      return next
    }),
    sendLetter: letter => mutate(next => {
      const senderId = next.activeUserId
      const recipientId: UserId = senderId === 'user-a' ? 'user-b' : 'user-a'
      const otherSent = next.exchange.letters.some(item => item.senderId === recipientId)
      const direct = next.exchange.method === 'tell-first' && senderId === 'user-a'
      const status: Letter['status'] = next.exchange.deliveryMode === 'scheduled' ? 'scheduled' : direct || otherSent ? 'delivered' : 'held'
      next.exchange.letters = next.exchange.letters.filter(item => item.senderId !== senderId)
      next.exchange.letters.push({ ...letter, id: `letter-${senderId}-${Date.now()}`, senderId, recipientId, status, sentAt: new Date().toISOString(), deliveredAt: status === 'delivered' ? new Date().toISOString() : undefined })
      if (otherSent && next.exchange.deliveryMode === 'immediate') {
        next.exchange.letters = next.exchange.letters.map(item => ({ ...item, status: item.status === 'read' ? 'read' : 'delivered', deliveredAt: item.deliveredAt ?? new Date().toISOString() }))
      }
      return next
    }),
    deliverLetters: () => mutate(next => {
      next.exchange.letters = next.exchange.letters.map(item => ({ ...item, status: item.status === 'read' ? 'read' : 'delivered', deliveredAt: item.deliveredAt ?? new Date().toISOString() }))
      return next
    }),
    markRead: letterId => mutate(next => {
      next.exchange.letters = next.exchange.letters.map(item => item.id === letterId ? { ...item, status: 'read', readAt: new Date().toISOString() } : item)
      const bothRead = next.exchange.letters.length >= 2 && next.exchange.letters.every(item => item.status === 'read')
      if (bothRead && next.exchange.intersectionStatus === 'ineligible') next.exchange.intersectionStatus = 'ready'
      return next
    }),
    reactToLetter: (letterId, reaction) => mutate(next => {
      next.exchange.letters = next.exchange.letters.map(item => item.id === letterId ? { ...item, status: 'read', reaction, readAt: item.readAt ?? new Date().toISOString() } : item)
      const bothRead = next.exchange.letters.length >= 2 && next.exchange.letters.every(item => item.status === 'read')
      if (bothRead && next.exchange.intersectionStatus === 'ineligible') next.exchange.intersectionStatus = 'ready'
      return next
    }),
    setIntersection: status => mutate(next => ({ ...next, exchange: { ...next.exchange, intersectionStatus: status } })),
    createMemoryFragment: () => mutate(next => {
      if (next.exchange.intersectionStatus === 'complete') next.exchange.memoryCreated = true
      return next
    }),
    updatePersonalization: patch => mutate(next => {
      next.personalization = { ...next.personalization, ...patch, personalizationUpdatedAt: new Date().toISOString() }
      if (patch.messengerType) next.users[next.activeUserId].messenger = patch.messengerType
      return next
    }),
    saveMemoryToTree: () => mutate(next => {
      if (next.exchange.memoryCreated) next.exchange.intersectionSaved = true
      return next
    }),
    water: () => mutate(next => {
      if (!next.exchange.wateredBy.includes(next.activeUserId)) next.exchange.wateredBy.push(next.activeUserId)
      return next
    }),
    loadSample: () => setState(makeCompleteState()),
    reset: () => {
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
      setState(makeInitialState())
    },
    seedBothDrafts: () => mutate(next => {
      next.exchange.joined = true
      if (!next.exchange.drafts['user-a'].rawText) next.exchange.drafts['user-a'] = { ...makeDraft('user-a'), rawText: sampleTexts['user-a'], savedAt: '刚刚' }
      if (!next.exchange.drafts['user-b'].rawText) next.exchange.drafts['user-b'] = { ...makeDraft('user-b'), rawText: sampleTexts['user-b'], savedAt: '刚刚' }
      return next
    }),
    seedBothLetters: () => mutate(next => {
      next.authenticated = true
      next.exchange.joined = true
      next.exchange.letters = [
        { id: 'letter-a', senderId: 'user-a', recipientId: 'user-b', title: modeAStory.letterTitles['user-a'], text: organizedTexts['user-a'], layout: 'balanced', illustration: 2, status: 'delivered', sentAt: new Date().toISOString(), deliveredAt: new Date().toISOString() },
        { id: 'letter-b', senderId: 'user-b', recipientId: 'user-a', title: modeAStory.letterTitles['user-b'], text: organizedTexts['user-b'], layout: 'balanced', illustration: 3, status: 'delivered', sentAt: new Date().toISOString(), deliveredAt: new Date().toISOString() },
      ]
      next.exchange.intersectionStatus = 'ineligible'
      next.exchange.memoryCreated = false
      next.exchange.intersectionSaved = false
      next.exchange.wateredBy = []
      return next
    }),
    toast: notify,
  }), [])

  return <DemoContext.Provider value={{ state, actions }}>{children}</DemoContext.Provider>
}

export const useDemo = () => {
  const value = useContext(DemoContext)
  if (!value) throw new Error('useDemo must be used inside DemoProvider')
  return value
}
