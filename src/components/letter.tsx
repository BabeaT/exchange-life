import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { StoryIllustration } from './characters'
import { PrimaryButton, SecondaryButton } from './ui'
import { getStationeryColorValue } from '../data/personalization'
import { useDemo } from '../store/DemoContext'
import type { DemoPersonalization, Letter } from '../types'

export function LetterCover({ title, sender, onOpen }: { title: string; sender: string; onOpen?: () => void }) {
  return <div className="letter-cover"><span className="cover-kicker">一封来自 {sender} 的信</span><div className="cover-window"><StoryIllustration variant={2} label="信件封面的叙事插图" /></div><h1>{title}</h1><span className="cover-seal">交换人生</span>{onOpen && <PrimaryButton onClick={onOpen}>打开这封信</PrimaryButton>}</div>
}

export function LetterPreview({ letter, stationery }: { letter: Pick<Letter, 'title' | 'text' | 'layout' | 'illustration'>; stationery?: { color: DemoPersonalization['stationeryColor']; texture: DemoPersonalization['stationeryTexture'] } }) {
  const { state } = useDemo()
  const paper = stationery || { color: state.personalization.stationeryColor, texture: state.personalization.stationeryTexture }
  const paragraphs = letter.text.split('\n').filter(Boolean)
  return <article className={`letter-paper layout-${letter.layout} stationery-texture-${paper.texture}`} style={{ backgroundColor: getStationeryColorValue(paper.color) }}><header><span>交换人生 · 一封只给你的信</span><h1>{letter.title}</h1></header><StoryIllustration variant={letter.illustration} label="AI 生成的叙事插图" /><div className="letter-copy">{(paragraphs.length ? paragraphs : [letter.text]).map((text, index) => <p key={index}>{text}</p>)}</div><footer><span>叙事插图 · 非真实影像</span><span>这封信只包含寄信人确认公开的内容</span></footer></article>
}

export function LetterReader({ letter, sender }: { letter: Letter; sender: string }) {
  const { state } = useDemo()
  const [page, setPage] = useState(0)
  const [playing, setPlaying] = useState(false)
  const pages = [
    <StoryIllustration key="art" variant={letter.illustration} label="信中叙事插图" />,
    <div key="text" className="reader-copy"><p>{letter.text}</p></div>,
  ]
  return <div className="letter-reader"><div className="reader-toolbar"><span>{sender} 写给你的信</span><div className="narration-control"><button onClick={() => setPlaying(value => !value)} aria-label={playing ? '暂停朗读' : '开始朗读'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button><Volume2 size={15} /><span>{playing ? '温暖中性声 · 正在朗读' : '主动开启语音读信'}</span></div></div><div className={`reader-page stationery-texture-${state.personalization.stationeryTexture}`} style={{ backgroundColor: getStationeryColorValue(state.personalization.stationeryColor) }}>{pages[page]}</div><div className="reader-nav"><SecondaryButton disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /> 上一页</SecondaryButton><span>{page + 1} / {pages.length}</span><PrimaryButton disabled={page === pages.length - 1} onClick={() => setPage(page + 1)}>下一页 <ChevronRight size={16} /></PrimaryButton></div><div className="reading-progress"><span style={{ width: `${((page + 1) / pages.length) * 100}%` }} /></div></div>
}
