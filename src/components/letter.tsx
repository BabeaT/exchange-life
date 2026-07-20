import { ChevronsDown, Music2, Pause, Play, ScrollText, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StoryIllustration, StoryPhoto } from './characters'
import { PrimaryButton } from './ui'
import { getStationeryColorValue } from '../data/personalization'
import { modeALetterScenes, modeAStory } from '../data/modeAStory'
import { ambientBgm } from '../lib/ambient-bgm'
import { useDemo } from '../store/DemoContext'
import type { DemoPersonalization, Letter, UserId } from '../types'

const sameStory = (ownerId: UserId, text: string) => text.trim() === modeAStory.organized[ownerId].trim()

export function LetterCover({ title, sender, senderId, onOpen }: { title: string; sender: string; senderId?: UserId; onOpen?: () => void }) {
  const cover = senderId ? modeALetterScenes[senderId][0] : undefined
  return <div className="letter-cover"><span className="cover-kicker">一封来自 {sender} 的信</span><div className="cover-window">{cover ? <StoryPhoto src={cover.image} alt={cover.alt} eager /> : <StoryIllustration variant={2} label="信件封面的叙事插图" />}</div><h1>{title}</h1><span className="cover-seal">交换人生</span>{onOpen && <PrimaryButton onClick={onOpen}>打开这封信</PrimaryButton>}</div>
}

export function LetterPreview({ letter, ownerId, stationery }: { letter: Pick<Letter, 'title' | 'text' | 'layout' | 'illustration'>; ownerId?: UserId; stationery?: { color: DemoPersonalization['stationeryColor']; texture: DemoPersonalization['stationeryTexture'] } }) {
  const { state } = useDemo()
  const storyOwner = ownerId || state.activeUserId
  const paper = stationery || { color: state.personalization.stationeryColor, texture: state.personalization.stationeryTexture }
  const paragraphs = letter.text.split('\n').filter(Boolean)
  const scenes = sameStory(storyOwner, letter.text) ? modeALetterScenes[storyOwner] : []

  return <article className={`letter-paper layout-${letter.layout} stationery-texture-${paper.texture}`} style={{ backgroundColor: getStationeryColorValue(paper.color) }}>
    <header><span>交换人生 · 一封只给你的信</span><h1>{letter.title}</h1>{scenes.length > 0 && <p>{scenes.length} 幕图文回忆 · 文字与插图均已由寄信人确认</p>}</header>
    {scenes.length ? <div className="illustrated-letter">{scenes.map((scene, index) => <section className="letter-scene" key={scene.id}><StoryPhoto src={scene.image} alt={scene.alt} caption={scene.caption} eager={index === 0} /><div className="letter-scene-copy"><span>第 {String(index + 1).padStart(2, '0')} 幕</span><h2>{scene.title}</h2>{scene.paragraphs.map((text, paragraphIndex) => <p key={paragraphIndex}>{text}</p>)}</div></section>)}</div> : <><StoryIllustration variant={letter.illustration} label="AI 生成的叙事插图" /><div className="letter-copy">{(paragraphs.length ? paragraphs : [letter.text]).map((text, index) => <p key={index}>{text}</p>)}</div></>}
    <footer><span>叙事插图 · 非真实影像</span><span>这封信只包含寄信人确认公开的内容</span></footer>
  </article>
}

type ReaderBlock =
  | { id: string; kind: 'heading'; sceneNumber: number; sceneCount: number; title: string }
  | { id: string; kind: 'paragraph'; text: string }
  | { id: string; kind: 'image'; src: string; alt: string; caption: string }

export function LetterReader({ letter, sender, onComplete }: { letter: Letter; sender: string; onComplete?: () => void }) {
  const { state } = useDemo()
  const scenes = useMemo(() => sameStory(letter.senderId, letter.text) ? modeALetterScenes[letter.senderId] : [], [letter.senderId, letter.text])
  const blocks = useMemo<ReaderBlock[]>(() => scenes.length ? scenes.flatMap((scene, sceneIndex) => {
    const imageAfter = Math.max(1, Math.ceil(scene.paragraphs.length / 2))
    return [
      { id: `${scene.id}-heading`, kind: 'heading' as const, sceneNumber: sceneIndex + 1, sceneCount: scenes.length, title: scene.title },
      ...scene.paragraphs.slice(0, imageAfter).map((text, index) => ({ id: `${scene.id}-before-${index}`, kind: 'paragraph' as const, text })),
      { id: `${scene.id}-image`, kind: 'image' as const, src: scene.image, alt: scene.alt, caption: scene.caption },
      ...scene.paragraphs.slice(imageAfter).map((text, index) => ({ id: `${scene.id}-after-${index}`, kind: 'paragraph' as const, text })),
    ]
  }) : letter.text.split('\n').filter(Boolean).map((text, index) => ({ id: `plain-${index}`, kind: 'paragraph' as const, text })), [letter.text, scenes])
  const [revealed, setRevealed] = useState(state.settings.reducedMotion ? blocks.length : 1)
  const [flowing, setFlowing] = useState(!state.settings.reducedMotion)
  const [autoFollow, setAutoFollow] = useState(true)
  const [musicOn, setMusicOn] = useState(ambientBgm.isPlaying())
  const [volume, setVolume] = useState(0.42)
  const completed = revealed >= blocks.length
  const completedRef = useRef(false)

  useEffect(() => {
    if (!flowing || completed) return
    const timer = window.setTimeout(() => setRevealed(value => Math.min(blocks.length, value + 1)), 1300)
    return () => window.clearTimeout(timer)
  }, [blocks.length, completed, flowing, revealed])

  useEffect(() => {
    if (!autoFollow || revealed <= 1) return
    const current = document.querySelector(`[data-reader-block="${revealed - 1}"]`)
    current?.scrollIntoView({ behavior: state.settings.reducedMotion ? 'auto' : 'smooth', block: 'center' })
  }, [autoFollow, revealed, state.settings.reducedMotion])

  useEffect(() => {
    if (!completed || completedRef.current) return
    completedRef.current = true
    onComplete?.()
  }, [completed, onComplete])

  const toggleMusic = async () => {
    if (musicOn) {
      ambientBgm.pause()
      setMusicOn(false)
      return
    }
    setMusicOn(await ambientBgm.play())
  }

  const updateVolume = (next: number) => {
    setVolume(next)
    ambientBgm.setVolume(next)
  }

  return <div className="letter-reader flowing-reader"><div className="reader-toolbar"><div><span>{sender} 写给你的信</span><small>{completed ? '故事已经完整浮现' : `正在浮现 · ${Math.round((revealed / blocks.length) * 100)}%`}</small></div><div className="reader-controls"><button title={flowing ? '暂停浮现' : '继续浮现'} onClick={() => setFlowing(value => !value)} disabled={completed} aria-label={flowing ? '暂停故事浮现' : '继续故事浮现'}>{flowing ? <Pause size={16} /> : <Play size={16} />}</button><button title="展开全文" onClick={() => { setRevealed(blocks.length); setFlowing(false) }} disabled={completed} aria-label="立即展开全文"><ChevronsDown size={16} /></button><button title={autoFollow ? '关闭自动跟随' : '开启自动跟随'} className={autoFollow ? 'active' : ''} onClick={() => setAutoFollow(value => !value)} aria-label={autoFollow ? '关闭自动跟随' : '开启自动跟随'}><ScrollText size={16} /></button><span className="reader-control-separator" /><button title={musicOn ? '暂停背景音乐' : '播放背景音乐'} className={musicOn ? 'active' : ''} onClick={toggleMusic} aria-label={musicOn ? '暂停背景音乐' : '播放背景音乐'}><Music2 size={16} /></button><Volume2 size={15} /><input type="range" min="0" max="1" step="0.05" value={volume} onChange={event => updateVolume(Number(event.target.value))} aria-label="背景音乐音量" /></div></div><article className={`reader-flow stationery-texture-${state.personalization.stationeryTexture}`} style={{ backgroundColor: getStationeryColorValue(state.personalization.stationeryColor) }} aria-live="polite">{blocks.map((block, index) => <div className={`reader-reveal ${index < revealed ? 'visible' : ''} reader-${block.kind}`} data-reader-block={index} key={block.id}>{block.kind === 'heading' && <header><span>第 {block.sceneNumber} / {block.sceneCount} 幕</span><h2>{block.title}</h2></header>}{block.kind === 'paragraph' && <p>{block.text}</p>}{block.kind === 'image' && <StoryPhoto src={block.src} alt={block.alt} caption={block.caption} eager={index < 5} />}</div>)}</article><div className="reader-flow-footer"><button className="subtle-link" onClick={() => setAutoFollow(value => !value)}>{autoFollow ? '正在自动跟随故事' : '继续自动跟随'}</button><button className="subtle-link" disabled={completed} onClick={() => { setRevealed(blocks.length); setFlowing(false) }}>展开全文</button></div><div className="reading-progress"><span style={{ width: `${(revealed / blocks.length) * 100}%` }} /></div></div>
}
