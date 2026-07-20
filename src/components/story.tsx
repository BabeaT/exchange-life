import { ImagePlus, Mic, Pause, Play, RotateCcw, Sparkles, Square, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useDemo } from '../store/DemoContext'
import type { ExchangeMethod, NarrativeType, StoryMedia } from '../types'
import { MessengerCharacter } from './characters'
import { PrimaryButton, SecondaryButton, StatusBanner } from './ui'

export function EventCard({ readonly = false, compactForm = false, children }: { readonly?: boolean; compactForm?: boolean; children?: ReactNode }) {
  const { state, actions } = useDemo()
  const context = state.exchange.context
  const fields = compactForm
    ? ([['事件发生的时间', 'time'], ['事件发生的地点', 'place'], ['事件的大致描述', 'clue']] as const)
    : ([['事件名称', 'title'], ['模式', 'theme'], ['时间', 'time'], ['地点', 'place'], ['参与者', 'people'], ['事件范围', 'range'], ['事件线索', 'clue'], ['引导语', 'reason']] as const)
  return <div className={`event-card ${compactForm ? 'event-card-compact' : ''}`}><div className="card-pin" />{!compactForm && <><span className="eyebrow">事件指引卡</span><h2>{context.title || '还没有名字的那件事'}</h2></>}{fields.map(([label, key]) => readonly ? <div className="context-row" key={key}><span>{label}</span><p>{context[key] || '未填写'}</p></div> : <label className={`field compact event-field-${key}`} key={key}><span>{label}</span>{key === 'clue' || key === 'reason' || key === 'range' ? <textarea value={context[key]} onChange={e => actions.updateContext({ [key]: e.target.value })} /> : <input value={context[key]} onChange={e => actions.updateContext({ [key]: e.target.value })} />}</label>)}<small className="privacy-note">{compactForm ? '对方只会用这张卡确认你描述的是哪件事。' : '这张卡只帮助对方认出事件，不预先判断谁对谁错，也不会泄露双方后续叙事。'}</small>{children}</div>
}

export function ThemeCard({ title, selected, onClick }: { title: string; selected: boolean; onClick: () => void }) {
  return <button className={`theme-card ${selected ? 'selected' : ''}`} onClick={onClick}><span className="theme-dot" /><span>{title}</span><small>{selected ? '已选择' : '轻轻展开一段人生'}</small></button>
}

export function ExchangeModeSelector({ narrativeType, method, onNarrative, onMethod }: { narrativeType: NarrativeType; method: ExchangeMethod; onNarrative: (value: NarrativeType) => void; onMethod: (value: ExchangeMethod) => void }) {
  return <div className="choice-dimensions"><fieldset><legend><span>01</span> 这次想交换什么？</legend><div className="choice-grid"><Choice selected={narrativeType === 'shared-event'} title="共同经历的一件事" description="重新讲述你们都曾在场的一段经历" onClick={() => onNarrative('shared-event')} /><Choice selected={narrativeType === 'life-fragment'} title="各自人生的一段故事" description="沿着同一主题，交换两段不同的人生" onClick={() => onNarrative('life-fragment')} /></div></fieldset><fieldset><legend><span>02</span> 想怎样交给对方？</legend><div className="choice-grid"><Choice selected={method === 'independent'} title="我们都写下自己的版本" description="彼此独立表达，都寄出后同时看见" onClick={() => onMethod('independent')} /><Choice selected={method === 'tell-first'} title="我想先把这一段告诉 TA" description="对方可以收下、回应，也可以以后回信" onClick={() => onMethod('tell-first')} /></div></fieldset></div>
}

function Choice({ selected, title, description, onClick }: { selected: boolean; title: string; description: string; onClick: () => void }) {
  return <button type="button" className={`choice-card ${selected ? 'selected' : ''}`} onClick={onClick}><span className="choice-radio">{selected ? '✓' : ''}</span><strong>{title}</strong><small>{description}</small></button>
}

export function VoiceRecorder() {
  const { actions } = useDemo()
  const [phase, setPhase] = useState<'idle' | 'ready' | 'recording' | 'processing' | 'done'>('idle')
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (phase !== 'recording') return
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [phase])
  const stop = () => {
    setPhase('processing')
    window.setTimeout(() => {
      const media: StoryMedia = { id: `audio-${Date.now()}`, kind: 'audio', name: `语音片段 ${seconds || 8}秒`, duration: seconds || 8, transcript: '那天在机场安检口，我们都笑了一下，还有很多话没有说。' }
      actions.addMedia(media)
      setPhase('done')
    }, 900)
  }
  return <div className="recorder"><div className="recorder-head"><Mic size={18} /><strong>语音讲述</strong><span>{phase === 'recording' ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : '回放默认关闭'}</span></div>{phase === 'idle' && <><p>可以像跟熟悉的人说话一样，不用着急，说错也没关系。</p><SecondaryButton onClick={() => setPhase('ready')}><Mic size={17} /> 准备录音</SecondaryButton></>}{phase === 'ready' && <div className="record-ready"><MessengerCharacter variant="cloud" size="small" /><p>准备好后再点击开始。停顿不会结束录音。</p><PrimaryButton onClick={() => { setSeconds(0); setPhase('recording') }}><Mic size={17} /> 开始录音</PrimaryButton></div>}{phase === 'recording' && <div className="recording"><div className="waveform">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ animationDelay: `${i * 70}ms` }} />)}</div><p>没关系，慢慢来，我在听。</p><SecondaryButton onClick={stop}><Square size={15} /> 停在这里</SecondaryButton></div>}{phase === 'processing' && <StatusBanner>正在理解方言并转写，原音已经保留…</StatusBanner>}{phase === 'done' && <StatusBanner tone="success">语音和模拟转写已保存，不会自动播放。</StatusBanner>}</div>
}

export function ImageUploader() {
  const { actions } = useDemo()
  const inputRef = useRef<HTMLInputElement>(null)
  const addMock = (file?: File) => {
    actions.addMedia({ id: `image-${Date.now()}`, kind: 'image', name: file?.name || '机场与行李箱.jpg', preview: file ? URL.createObjectURL(file) : undefined, transcript: '图片说明：装满药和食物的行李箱，以及机场安检口的黄色等候线。' })
  }
  return <div className="image-uploader"><ImagePlus size={24} /><strong>加入一张记忆材料</strong><p>旧照片、票据或手写内容都可以。原图默认只对你可见。</p><input ref={inputRef} type="file" accept="image/*" hidden onChange={e => addMock(e.target.files?.[0])} /><SecondaryButton onClick={() => inputRef.current?.click()}><Upload size={16} /> 选择图片</SecondaryButton><button className="mock-link" onClick={() => addMock()}>或加入演示图片</button></div>
}

export function StoryEditor() {
  const { state, actions } = useDemo()
  const draft = state.exchange.drafts[state.activeUserId]
  const [tab, setTab] = useState<'text' | 'voice' | 'image'>('text')
  return <div className="story-editor"><div className="editor-tabs" role="tablist"><button className={tab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>文字</button><button className={tab === 'voice' ? 'active' : ''} onClick={() => setTab('voice')}>语音</button><button className={tab === 'image' ? 'active' : ''} onClick={() => setTab('image')}>图片</button></div>{tab === 'text' && <div className="editor-text"><textarea aria-label="写下你的故事" placeholder="不用先想好开头。从你仍记得的一个细节写起……" value={draft.rawText} onChange={e => actions.updateDraft(state.activeUserId, { rawText: e.target.value, confirmed: false, phase: 'editing' })} /><div className="editor-meta"><span>{draft.savedAt ? `已自动保存 · ${draft.savedAt}` : '输入后自动保存'}</span><span>{draft.rawText.length} 字</span></div></div>}{tab === 'voice' && <VoiceRecorder />}{tab === 'image' && <ImageUploader />}{draft.media.length > 0 && <div className="media-list">{draft.media.map(item => <div className="media-item" key={item.id}>{item.kind === 'audio' ? <button className="media-icon" aria-label="播放语音"><Play size={16} /></button> : item.preview ? <img src={item.preview} alt={item.name} /> : <span className="mock-photo"><ImagePlus size={18} /></span>}<div><strong>{item.name}</strong><small>{item.transcript}</small></div><button className="icon-button" aria-label={`删除${item.name}`} onClick={() => actions.removeMedia(item.id)}><Trash2 size={16} /></button></div>)}</div>}</div>
}

export function AICompanion() {
  const { state } = useDemo()
  const draft = state.exchange.drafts[state.activeUserId]
  const [open, setOpen] = useState(false)
  const [prompted, setPrompted] = useState(false)
  return <aside className={`ai-companion ${open ? 'expanded' : ''}`}><button className="companion-character" aria-label="唤醒陪伴助手" onClick={() => setOpen(value => !value)}><MessengerCharacter variant="pebble" size="small" /><span>{open ? '先收起来' : '需要时叫我'}</span></button>{prompted && !open && <button className="gentle-bubble" onClick={() => setOpen(true)}>需要我陪你理一理吗？</button>}{open && <div className="companion-panel"><div className="companion-title"><Sparkles size={16} /><strong>安静陪你理一理</strong></div><p>{draft.rawText ? '你写到了晚饭、行李、机场，以及后来没有发出的长消息。' : '你可以先从一个仍然清楚的画面开始。'}</p><button>回顾刚才写了什么</button><button>给我一个很轻的提示</button><blockquote>离开之前，哪一句话最接近你当时没有说出的部分？</blockquote><button className="close-companion" onClick={() => setOpen(false)}>先不用了</button></div>}<button className="simulate-pause" onClick={() => { setPrompted(true); setOpen(false) }}><Pause size={14} /> 模拟停顿 10–15 分钟</button></aside>
}

export function TextImageRatioControl({ value, onChange }: { value: 'text' | 'balanced' | 'image'; onChange: (value: 'text' | 'balanced' | 'image') => void }) {
  return <div className="ratio-control" aria-label="图文比例">{([['text', '文字为主'], ['balanced', '图文平衡'], ['image', '图片为主']] as const).map(([id, label]) => <button key={id} className={value === id ? 'active' : ''} onClick={() => onChange(id)}><span className={`ratio-icon ${id}`} /><span>{label}</span></button>)}</div>
}

export function VersionTools({ onRetry, onRestore }: { onRetry: () => void; onRestore: () => void }) {
  return <div className="version-tools"><SecondaryButton onClick={onRetry}><Sparkles size={16} /> 重新整理</SecondaryButton><SecondaryButton onClick={onRestore}><RotateCcw size={16} /> 恢复上一版</SecondaryButton></div>
}
