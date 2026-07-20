import { ArrowLeft, ArrowRight, Check, Clock3, LockKeyhole, RotateCcw, Send, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AICompanion, StoryEditor, TextImageRatioControl, VersionTools } from '../components/story'
import { LetterPreview } from '../components/letter'
import { LoadingState, PaperPanel, PrimaryButton, SecondaryButton, StatusBanner } from '../components/ui'
import { StoryIllustration } from '../components/characters'
import { organizedTexts } from '../data/demoData'
import { modeAStory } from '../data/modeAStory'
import { useDemo } from '../store/DemoContext'

export function WritePage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const draft = state.exchange.drafts[state.activeUserId]
  return <div className="page write-page"><header className="write-header"><Link to={`/exchanges/${state.exchange.id}`} className="back-link"><ArrowLeft size={16} /> 回到双人空间</Link><div><span className="eyebrow">{state.exchange.narrativeType === 'shared-event' ? state.exchange.context.title : state.exchange.context.theme}</span><h1>写下你的版本</h1></div><div className="private-badge"><LockKeyhole size={15} /> 只对你可见</div></header><div className="write-layout"><main><PaperPanel className="writing-prompt"><span>可以从这里开始</span><p>{state.exchange.narrativeType === 'shared-event' ? '那天最先浮现在你眼前的，是什么？' : '这一次，你想把人生中的哪一部分交给对方？'}</p></PaperPanel><StoryEditor /></main><AICompanion /></div><div className="sticky-actions"><div><strong>{draft.savedAt ? '草稿已自动保存' : '还没有开始输入'}</strong><small>关闭页面后，Demo 会从 localStorage 恢复</small></div><SecondaryButton onClick={() => navigate('/letters')}>先停在这里</SecondaryButton><PrimaryButton disabled={!draft.rawText.trim()} onClick={() => navigate(`/exchanges/${state.exchange.id}/organize`)}>完成表达，交给 AI 整理 <ArrowRight size={17} /></PrimaryButton></div></div>
}

export function OrganizePage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const draft = state.exchange.drafts[state.activeUserId]
  const [phase, setPhase] = useState<'intro' | 'loading' | 'result' | 'error'>(draft.organizedText ? 'result' : 'intro')
  const [text, setText] = useState(draft.organizedText || draft.rawText)
  const run = (fail = false) => {
    setPhase('loading')
    window.setTimeout(() => {
      actions.organizeDraft(fail)
      if (fail) setPhase('error')
      else { setText(organizedTexts[state.activeUserId]); setPhase('result') }
    }, 950)
  }
  if (phase === 'intro') return <div className="page organize-intro"><Link to={`/exchanges/${state.exchange.id}/write`} className="back-link"><ArrowLeft size={16} /> 返回补充</Link><header className="page-heading"><span className="eyebrow">AI 叙事整理</span><h1>整理不会覆盖你的原话</h1><p>AI 只会调整段落、顺序和口语重复。任何结果都需要你本人确认。</p></header><div className="privacy-layers"><PaperPanel><span>01</span><h3>原始表达</h3><p>文字、原音、图片和完整转写始终由你保留。</p></PaperPanel><PaperPanel><span>02</span><h3>整理候选稿</h3><p>仅你可见，可以编辑、重整或放弃。</p></PaperPanel><PaperPanel><span>03</span><h3>正式信件</h3><p>只有点击本人确认后，才允许进入寄出预览。</p></PaperPanel></div><div className="organize-actions"><SecondaryButton onClick={() => run(true)}>演示 AI 失败</SecondaryButton><PrimaryButton onClick={() => run()}><Sparkles size={17} /> 开始整理</PrimaryButton></div></div>
  if (phase === 'loading') return <div className="page"><LoadingState label="正在辨认你想保留的叙事顺序…" /></div>
  if (phase === 'error') return <div className="page"><div className="center-state"><span className="state-mark">…</span><h1>这一次没有整理成功</h1><p>你的原始文字、录音和图片都没有受到影响。</p><div><SecondaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/write`)}>回到人工编辑</SecondaryButton><PrimaryButton onClick={() => run()}>重新整理</PrimaryButton></div></div></div>
  return <div className="page organize-result"><header className="page-heading inline-heading"><div><span className="eyebrow">待本人确认</span><h1>这还是你想说的吗？</h1><p>对照原始表达，直接修改任何不准确的地方。</p></div><div className="private-badge"><LockKeyhole size={15} /> 对方不可见</div></header><div className="compare-layout"><PaperPanel className="source-panel"><span className="eyebrow">原始表达 · 保持不变</span><p>{draft.rawText}</p>{draft.media.map(item => <div className="source-media" key={item.id}><strong>{item.name}</strong><small>{item.transcript}</small></div>)}</PaperPanel><PaperPanel className="organized-panel"><span className="eyebrow">AI 整理候选稿 · 可编辑</span><textarea aria-label="编辑整理后的信件草稿" value={text} onChange={e => setText(e.target.value)} /><div className="change-note"><Check size={15} /> 保留了“记不清具体年份”的不确定表达</div></PaperPanel></div><VersionTools onRetry={() => run()} onRestore={() => setText(draft.organizedText || draft.rawText)} /><div className="confirm-notice"><LockKeyhole size={18} /><p><strong>确认前，不会进入信件或被对方看见。</strong><br />确认后如果继续修改正文，插图和版式需要重新同步。</p></div><div className="sticky-actions"><SecondaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/write`)}>返回补充原始内容</SecondaryButton><PrimaryButton onClick={() => { actions.confirmDraft(text); navigate(`/exchanges/${state.exchange.id}/compose`) }}>这就是我想说的 <Check size={17} /></PrimaryButton></div></div>
}

export function ComposePage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const draft = state.exchange.drafts[state.activeUserId]
  const [layout, setLayout] = useState<'text' | 'balanced' | 'image'>('balanced')
  const [illustration, setIllustration] = useState(0)
  const [title, setTitle] = useState(modeAStory.letterTitles[state.activeUserId])
  return <div className="page compose-page"><header className="page-heading inline-heading"><div><span className="eyebrow">图文信件</span><h1>把确认过的文字，放进一封信里</h1><p>插图是叙事想象，不会被当作真实影像。</p></div><StatusBanner tone="success">文字已由本人确认</StatusBanner></header><div className="compose-layout"><aside className="compose-controls"><PaperPanel><label className="field"><span>信件标题</span><input value={title} onChange={e => setTitle(e.target.value)} /></label><span className="control-label">图文比例</span><TextImageRatioControl value={layout} onChange={setLayout} /></PaperPanel><PaperPanel><span className="control-label">模拟事件插图</span><div className="illustration-options">{[0, 1, 2, 3].map(item => <button key={item} className={illustration === item ? 'selected' : ''} onClick={() => setIllustration(item)}><StoryIllustration variant={item} label={['饭菜已经变凉的餐桌', '摊开的行李箱和被放回去的零食', '车窗与站台上的两个人', '两个城市的夜晚与没有发出的长消息'][item]} /><span>方案 {item + 1}</span></button>)}</div><SecondaryButton onClick={() => setIllustration((illustration + 1) % 4)}><RotateCcw size={16} /> 更换模拟插图</SecondaryButton></PaperPanel></aside><div className="compose-preview"><LetterPreview letter={{ title, text: draft.organizedText, layout, illustration }} /></div></div><div className="sticky-actions"><SecondaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/organize`)}>修改文字</SecondaryButton><PrimaryButton onClick={() => { actions.toast('图文信件候选已保存'); navigate(`/exchanges/${state.exchange.id}/preview?title=${encodeURIComponent(title)}&layout=${layout}&art=${illustration}`) }}>进入完整预览 <ArrowRight size={17} /></PrimaryButton></div></div>
}

export function PreviewPage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const draft = state.exchange.drafts[state.activeUserId]
  const letter = { title: params.get('title') || modeAStory.letterTitles[state.activeUserId], text: draft.organizedText, layout: (params.get('layout') || 'balanced') as 'text' | 'balanced' | 'image', illustration: Number(params.get('art') || 0) }
  return <div className="page preview-page"><header className="page-heading inline-heading"><div><span className="eyebrow">收信人视角预览</span><h1>寄出前的最后一遍</h1><p>对方只会看到下面这封正式信，不会看到整理过程。</p></div><div className="private-badge"><LockKeyhole size={15} /> 尚未公开</div></header><div className="preview-stage"><LetterPreview letter={letter} /></div><div className="sticky-actions"><SecondaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/compose`)}>返回修改</SecondaryButton><PrimaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/send`, { state: letter })}>确认最终版本 <ArrowRight size={17} /></PrimaryButton></div></div>
}

export function SendSettingsPage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const [mode, setMode] = useState(state.exchange.deliveryMode)
  const [date, setDate] = useState(state.exchange.scheduledAt || '2026-07-20T20:00')
  const [sending, setSending] = useState(false)
  const [fail, setFail] = useState(false)
  const draft = state.exchange.drafts[state.activeUserId]
  const send = () => {
    setSending(true); setFail(false)
    window.setTimeout(() => {
      actions.updateExchange({ deliveryMode: mode, scheduledAt: mode === 'scheduled' ? date : '' })
      actions.sendLetter({ title: modeAStory.letterTitles[state.activeUserId], text: draft.organizedText, layout: 'balanced', illustration: state.activeUserId === 'user-a' ? 2 : 3, sentAt: new Date().toISOString() })
      setSending(false); navigate(`/exchanges/${state.exchange.id}/waiting`)
    }, 700)
  }
  return <div className="page send-page"><header className="page-heading"><span className="eyebrow">发送与交换设置</span><h1>决定这封信什么时候抵达</h1><p>{state.exchange.method === 'independent' ? '你可以先寄出。系统会托管信件，直到双方都准备好。' : '这封信可以先抵达，对方不需要立即回信。'}</p></header><div className="send-options"><button className={mode === 'immediate' ? 'selected' : ''} onClick={() => setMode('immediate')}><Send /><div><h3>{state.exchange.method === 'independent' ? '双方都寄出后交换' : '确认后立即送达'}</h3><p>{state.exchange.method === 'independent' ? '先完成的人会安心等待，不会暴露信件内容。' : '对方可以只用一个专属表情收下。'}</p></div></button><button className={mode === 'scheduled' ? 'selected' : ''} onClick={() => setMode('scheduled')}><Clock3 /><div><h3>设定交换时间</h3><p>到达双方约定的时间，并满足寄出条件后再送达。</p></div></button></div>{mode === 'scheduled' && <PaperPanel className="schedule-panel"><label className="field"><span>约定时间</span><input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /></label><div><SecondaryButton onClick={() => setMode('immediate')}>取消定时</SecondaryButton><small>你可以在正式送达前回来修改时间。</small></div></PaperPanel>}{fail && <StatusBanner tone="error">发送没有成功，信件仍保留在本地。请重试。</StatusBanner>}<PaperPanel className="send-confirm"><LockKeyhole /><div><h3>确认寄出代表你愿意公开这一版信件</h3><p>原始录音、原始图片、完整转写和私人草稿仍然只对你可见。</p></div></PaperPanel><div className="send-demo-error"><button onClick={() => setFail(true)}>演示发送失败</button></div><div className="sticky-actions"><SecondaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/preview`)}>再看一遍</SecondaryButton><PrimaryButton disabled={sending} onClick={send}>{sending ? '正在寄出…' : '确认寄出'} <Send size={17} /></PrimaryButton></div></div>
}

export function WaitingPage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const mine = state.exchange.letters.find(item => item.senderId === state.activeUserId)
  const other = state.exchange.letters.find(item => item.senderId !== state.activeUserId)
  const delivered = mine?.status === 'delivered' || mine?.status === 'read'
  return <div className="page waiting-page"><div className="waiting-visual"><div className="held-letter">✉</div><span className="waiting-thread" /><div className="waiting-dot" /></div><header><span className="eyebrow">{delivered ? '双方都已经准备好' : mine?.status === 'scheduled' ? '信件正在等待约定时间' : state.exchange.method === 'tell-first' ? '信已经出发' : '你的信已由系统保管'}</span><h1>{delivered ? '两封信已经交换' : other ? '等待正式送达' : '现在，可以安心等一等'}</h1><p>{state.exchange.method === 'independent' && !delivered ? '对方不会看到信件正文，也不会看到你的字数和完成时间。' : '对方会在主动打开信封后看到最终确认内容。'}</p></header><div className="waiting-statuses"><div className="done"><Check />你的信已寄出</div><div className={other ? 'done' : ''}>{other ? <Check /> : <span>·</span>}{other ? '对方也已寄出' : '对方正在准备'}</div><div className={delivered ? 'done' : ''}>{delivered ? <Check /> : <span>·</span>}{delivered ? '信件已送达' : state.exchange.deliveryMode === 'scheduled' ? '等待约定时间' : '等待交换条件'}</div></div><div className="waiting-actions"><SecondaryButton onClick={() => navigate('/letters')}>返回我的信件</SecondaryButton>{!other && <SecondaryButton onClick={() => { actions.seedBothDrafts(); actions.setActiveUser(state.activeUserId === 'user-a' ? 'user-b' : 'user-a'); navigate(`/exchanges/${state.exchange.id}/write`) }}>切换身份，完成对方表达</SecondaryButton>}{other && !delivered && <PrimaryButton onClick={() => { actions.deliverLetters(); actions.toast('两封信已同时送达') }}>模拟达到交换条件</PrimaryButton>}{delivered && <PrimaryButton onClick={() => navigate('/letters')}>去看看收到的信</PrimaryButton>}</div></div>
}
