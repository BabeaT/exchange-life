import { ArrowLeft, ArrowRight, CalendarClock, Check, Clipboard, Copy, Link2, RefreshCcw, Send, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EventCard, ExchangeModeSelector, ThemeCard } from '../components/story'
import { MessengerCharacter } from '../components/characters'
import { PaperPanel, PrimaryButton, SecondaryButton, StatusBanner, TextArea } from '../components/ui'
import { themes } from '../data/demoData'
import { useDemo } from '../store/DemoContext'

export function CreateExchangePage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  return <div className="page create-page"><Link to="/home" className="back-link"><ArrowLeft size={16} /> 返回首页</Link><header className="page-heading"><span className="eyebrow">创建一次交换</span><h1>先决定这次想交换什么</h1><p>内容和方式是两个独立选择。任何一种故事，都可以慢慢互换，也可以由你先说。</p></header><ExchangeModeSelector narrativeType={state.exchange.narrativeType} method={state.exchange.method} onNarrative={narrativeType => actions.updateExchange({ narrativeType })} onMethod={method => actions.updateExchange({ method })} /><PaperPanel className="combination-preview"><span className="eyebrow">你正在创建</span><h3>{state.exchange.narrativeType === 'shared-event' ? '共同事件' : '人生片段'} × {state.exchange.method === 'independent' ? '双方独立表达' : '我先告诉对方'}</h3><p>{combinationCopy(state.exchange.narrativeType, state.exchange.method)}</p></PaperPanel><div className="sticky-actions"><span>下一步：{state.exchange.narrativeType === 'shared-event' ? '填写共同事件线索' : '选择人生主题'}</span><PrimaryButton onClick={() => navigate(state.exchange.narrativeType === 'shared-event' ? '/exchanges/new/event' : '/exchanges/new/theme')}>继续 <ArrowRight size={17} /></PrimaryButton></div></div>
}

function combinationCopy(type: 'shared-event' | 'life-fragment', method: 'independent' | 'tell-first') {
  if (type === 'shared-event' && method === 'independent') return '围绕同一件事，各自写下记得的版本。两封信都寄出后再同时看见。'
  if (type === 'shared-event') return '你先讲同一件事里的自己。对方可以收下、回应，或以后再回信。'
  if (method === 'independent') return '沿着同一人生主题，各自讲述不同的片段。彼此独立完成后交换。'
  return '你先把自己的一段人生交给对方。对方不需要立刻讲述自己的故事。'
}

export function EventContextPage() {
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)
  return <div className="page context-page"><Link to="/exchanges/new" className="back-link"><ArrowLeft size={16} /> 返回选择</Link><header className="page-heading"><span className="eyebrow">共同事件线索卡</span><h1>让对方知道，你说的是哪一件事</h1><p>只写中性的时间、地点和线索。你的感受留在自己的表达里。</p></header><div className="context-layout"><EventCard /><aside><PaperPanel><h3>这张卡会怎样被使用？</h3><ol><li>由你填写并确认</li><li>对方加入后只能阅读</li><li>双方的私人表达互不可见</li><li>不会把单方判断整理成共同事实</li></ol></PaperPanel><PaperPanel className="material-drop"><Clipboard size={22} /><strong>可选补充材料</strong><p>加入图片只帮助对方辨认事件，默认不会进入最终信件。</p><SecondaryButton>选择一张图片</SecondaryButton></PaperPanel></aside></div>{confirmed && <StatusBanner tone="success">事件卡已由你确认。对方看到的是这一版中性线索。</StatusBanner>}<div className="sticky-actions"><SecondaryButton onClick={() => setConfirmed(true)}><Check size={17} /> 预览并确认</SecondaryButton><PrimaryButton disabled={!confirmed} onClick={() => navigate('/exchanges/new/review')}>继续创建 <ArrowRight size={17} /></PrimaryButton></div></div>
}

export function ThemeContextPage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const [custom, setCustom] = useState('')
  const choose = (theme: string) => actions.updateContext({ theme })
  return <div className="page context-page"><Link to="/exchanges/new" className="back-link"><ArrowLeft size={16} /> 返回选择</Link><header className="page-heading"><span className="eyebrow">人生片段主题卡</span><h1>为两段不同的人生，留一个共同方向</h1><p>不要求讲同一件事，也不强制填写日期和完整时间线。</p></header><div className="theme-grid">{themes.map(theme => <ThemeCard key={theme} title={theme} selected={state.exchange.context.theme === theme} onClick={() => choose(theme)} />)}</div><PaperPanel className="custom-theme"><TextArea label="或者，写下自己的主题" placeholder="例如：关于那次没有说出口的告别……" value={custom} onChange={e => setCustom(e.target.value)} /><SecondaryButton disabled={!custom.trim()} onClick={() => choose(custom.trim())}>使用这个主题</SecondaryButton></PaperPanel><div className="sticky-actions"><span>已选择：{state.exchange.context.theme || '还没有选择'}</span><PrimaryButton disabled={!state.exchange.context.theme} onClick={() => navigate('/exchanges/new/review')}>继续创建 <ArrowRight size={17} /></PrimaryButton></div></div>
}

export function CreateReviewPage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(state.exchange.deliveryMode)
  const [scheduledAt, setScheduledAt] = useState(state.exchange.scheduledAt)
  const create = () => {
    actions.updateExchange({ deliveryMode: delivery, scheduledAt })
    navigate(`/exchanges/${state.exchange.id}/invite`)
  }
  return <div className="page review-page"><Link to={state.exchange.narrativeType === 'shared-event' ? '/exchanges/new/event' : '/exchanges/new/theme'} className="back-link"><ArrowLeft size={16} /> 返回修改</Link><header className="page-heading"><span className="eyebrow">创建确认</span><h1>在发出邀请前，再看一遍</h1></header><div className="review-grid"><PaperPanel className="review-summary"><span className="eyebrow">交换方式</span><h2>{state.exchange.narrativeType === 'shared-event' ? '共同事件' : '人生片段'} × {state.exchange.method === 'independent' ? '双方独立表达' : '我先告诉对方'}</h2><p>{combinationCopy(state.exchange.narrativeType, state.exchange.method)}</p><dl><div><dt>{state.exchange.narrativeType === 'shared-event' ? '事件' : '主题'}</dt><dd>{state.exchange.narrativeType === 'shared-event' ? state.exchange.context.title : state.exchange.context.theme}</dd></div><div><dt>双方</dt><dd>{state.users['user-a'].name} 与等待加入的人</dd></div><div><dt>隐私</dt><dd>原始素材与草稿仅本人可见</dd></div></dl></PaperPanel><PaperPanel><span className="eyebrow">送达方式</span><div className="delivery-options"><button className={delivery === 'immediate' ? 'selected' : ''} onClick={() => setDelivery('immediate')}><Send /><div><strong>{state.exchange.method === 'independent' ? '双方完成后立即交换' : '确认寄出后送达'}</strong><small>{state.exchange.method === 'independent' ? '先寄出的信会被系统托管' : '对方不需要先回信'}</small></div></button><button className={delivery === 'scheduled' ? 'selected' : ''} onClick={() => setDelivery('scheduled')}><CalendarClock /><div><strong>约定一个交换时间</strong><small>时间到且满足寄出条件后送达</small></div></button></div>{delivery === 'scheduled' && <label className="field"><span>约定时间</span><input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} /></label>}</PaperPanel></div><div className="sticky-actions"><span>创建后仍可回到这里修改未开始的交换。</span><PrimaryButton onClick={create}>创建并生成邀请 <ArrowRight size={17} /></PrimaryButton></div></div>
}

export function InvitePage() {
  const { state, actions } = useDemo()
  const [copied, setCopied] = useState('')
  const copy = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value) } catch { /* Demo may run without clipboard permission */ }
    setCopied(label); actions.toast(`${label}已复制`)
  }
  const text = `${state.users['user-a'].name} 想和你一起回看“${state.exchange.title}”。打开交换人生，输入邀请码 ${state.exchange.code}。不用急着回复，慢慢来。`
  return <div className="page invite-page"><header className="page-heading inline-heading"><div><span className="eyebrow">交换已经创建</span><h1>把邀请交给熟悉的人</h1><p>这不是公开招募。请通过你们平时联系的方式，私下发给对方。</p></div><MessengerCharacter variant="moss" size="large" mood="carrying" /></header><div className="invite-layout"><PaperPanel className="invitation-card"><span className="eyebrow">邀请码</span><strong className="invite-code">{state.exchange.code}</strong><div className="invite-buttons"><PrimaryButton onClick={() => copy(state.exchange.code, '邀请码')}><Copy size={17} /> {copied === '邀请码' ? '已复制' : '复制邀请码'}</PrimaryButton><SecondaryButton onClick={() => copy(text, '邀请文案')}><Clipboard size={17} /> 复制邀请文案</SecondaryButton></div><button className="share-simulate" onClick={() => actions.toast('已打开模拟分享面板')}><Share2 size={17} /> 模拟分享到微信 / QQ</button></PaperPanel><PaperPanel className="invite-message"><span className="eyebrow">对方会看到</span><div className="message-preview"><span className="avatar-small">{state.users['user-a'].avatar}</span><p>{text}</p></div><div className="invite-link"><Link2 size={16} /><code>http://localhost:4173/join?code={state.exchange.code}</code></div></PaperPanel></div><PaperPanel className="join-status"><div><span className={`status-orb ${state.exchange.joined ? 'joined' : ''}`} /><div><strong>{state.exchange.joined ? '对方已经加入' : '正在等待对方加入'}</strong><small>{state.exchange.joined ? '你们可以分别开始表达了' : '对方不会看到你的草稿和具体进度'}</small></div></div>{state.exchange.joined ? <Link to={`/exchanges/${state.exchange.id}/write`}><PrimaryButton>开始我的表达</PrimaryButton></Link> : <div className="join-simulation"><SecondaryButton onClick={() => actions.updateExchange({ joined: true })}>模拟对方加入</SecondaryButton><button onClick={() => actions.toast('已生成新的演示邀请码')}><RefreshCcw size={15} /> 邀请失效 / 重新生成</button></div>}</PaperPanel></div>
}

export function ContextReadPage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const [unsure, setUnsure] = useState(false)
  return <div className="page context-read-page"><header className="page-heading"><span className="eyebrow">{state.users['user-a'].name} 邀请你回看</span><h1>{state.exchange.narrativeType === 'shared-event' ? '你知道是哪一件事吗？' : '这次沿着这个主题出发'}</h1><p>这张卡由发起人确认。你可以阅读，但不能修改。</p></header>{state.exchange.narrativeType === 'shared-event' ? <EventCard readonly /> : <PaperPanel className="big-theme"><span>人生主题</span><h2>{state.exchange.context.theme}</h2><p>你不需要讲同一件事，只要讲出这个主题在你人生里唤起的一段。</p></PaperPanel>}{unsure && <StatusBanner tone="warning">没关系，你可以稍后继续。Demo 中可以请发起人补充一条中性线索。</StatusBanner>}<div className="sticky-actions"><SecondaryButton onClick={() => setUnsure(true)}>我还不太确定</SecondaryButton><PrimaryButton onClick={() => { actions.updateExchange({ joined: true }); navigate(`/exchanges/${state.exchange.id}/write`) }}>{state.exchange.narrativeType === 'shared-event' ? '我知道是哪件事，开始讲述' : '从这个主题开始'} <ArrowRight size={17} /></PrimaryButton></div></div>
}
