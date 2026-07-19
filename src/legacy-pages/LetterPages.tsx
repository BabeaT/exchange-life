import { ArrowLeft, ArrowRight, Check, Clock3, Heart, MailOpen, RefreshCcw, Reply, Save, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DeliveryAnimation } from './deliveryParts'
import { LetterCover, LetterReader } from '../components/letter'
import { ViewpointComparison } from '../components/memory'
import { PaperPanel, PrimaryButton, SecondaryButton } from '../components/ui'
import { reactions } from '../data/demoData'
import { useDemo } from '../store/DemoContext'

export function DeliveryPage() {
  const { state } = useDemo()
  const { letterId } = useParams()
  const navigate = useNavigate()
  const letter = state.exchange.letters.find(item => item.id === letterId)
  const [arrived, setArrived] = useState(false)
  useEffect(() => { const timer = window.setTimeout(() => setArrived(true), state.settings.reducedMotion ? 100 : 1400); return () => clearTimeout(timer) }, [state.settings.reducedMotion])
  if (!letter) return <MissingLetter />
  return <div className="page delivery-page"><DeliveryAnimation arrived={arrived} reduced={state.settings.reducedMotion} messenger={state.users[letter.senderId].messenger} /><div className={`delivery-message ${arrived ? 'visible' : ''}`}><span className="eyebrow">一封信抵达了</span><h1>{state.users[letter.senderId].name} 把一段人生交给了你</h1><p>只有对方最终确认的正式信件。原始材料不会出现在这里。</p><PrimaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/letters/${letter.id}`)}><MailOpen size={18} /> 接住并打开</PrimaryButton><button onClick={() => setArrived(true)}>跳过动画</button></div></div>
}

function MissingLetter() { return <div className="page"><div className="center-state"><h1>这封信还没有抵达</h1><p>它可能仍在托管，或链接已经失效。</p><Link to="/home"><PrimaryButton>返回首页</PrimaryButton></Link></div></div> }

export function ReadLetterPage() {
  const { state, actions } = useDemo()
  const { letterId } = useParams()
  const navigate = useNavigate()
  const letter = state.exchange.letters.find(item => item.id === letterId)
  const [opened, setOpened] = useState(false)
  if (!letter) return <MissingLetter />
  const sender = state.users[letter.senderId]
  return <div className="page read-page"><Link to="/letters" className="back-link"><ArrowLeft size={16} /> 回到信件</Link>{!opened ? <LetterCover title={letter.title} sender={sender.name} onOpen={() => setOpened(true)} /> : <><LetterReader letter={letter} sender={sender.name} /><div className="reader-complete"><p>读到这里时，你可以用一个动作收下这封信。</p><PrimaryButton onClick={() => { actions.markRead(letter.id); navigate(`/exchanges/${state.exchange.id}/letters/${letter.id}/respond`) }}>我读完了 <ArrowRight size={17} /></PrimaryButton></div></>}</div>
}

export function ReactionPage() {
  const { state, actions } = useDemo()
  const { letterId } = useParams()
  const navigate = useNavigate()
  const letter = state.exchange.letters.find(item => item.id === letterId)
  const [selected, setSelected] = useState(letter?.reaction || '')
  if (!letter) return <MissingLetter />
  const send = () => {
    actions.reactToLetter(letter.id, selected)
    actions.toast('你的回应已经轻轻抵达')
    navigate(`/exchanges/${state.exchange.id}/reply-choice/${letter.id}`)
  }
  return <div className="page reaction-page"><header className="page-heading"><span className="eyebrow">不用急着说很多</span><h1>你想怎样收下这封信？</h1><p>选择一个最接近此刻的动作。它不是聊天，也不会形成无限消息流。</p></header><div className="reaction-grid">{reactions.map(item => <button key={item.id} className={selected === item.label ? 'selected' : ''} onClick={() => setSelected(item.label)}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.id === 'thinking' ? '允许自己再慢一点' : '让对方知道你看见了'}</small></button>)}</div><div className="sticky-actions"><button className="subtle-link" onClick={() => navigate('/home')}>暂时不回应</button><PrimaryButton disabled={!selected} onClick={send}><Heart size={17} /> 发送这个回应</PrimaryButton></div></div>
}

export function ReplyChoicePage() {
  const { state } = useDemo()
  const { letterId } = useParams()
  const letter = state.exchange.letters.find(item => item.id === letterId)
  const navigate = useNavigate()
  return <div className="page reply-choice-page"><div className="reply-mark"><Check /></div><span className="eyebrow">回应已经送达</span><h1>这封信可以先停在这里</h1><p>你不需要立刻回信。以后准备好时，入口仍会在。</p><div className="reply-options"><PaperPanel><Heart /><h3>先轻轻收下</h3><p>只保留刚才的专属回应，不生成 AI 交汇，也没有等待任务。</p><PrimaryButton onClick={() => navigate('/home')}>就停在这里</PrimaryButton></PaperPanel><PaperPanel><Reply /><h3>我也想写一封回信</h3><p>回信会关联原信，但仍然从你的私人表达空间开始。</p><SecondaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/write?replyTo=${letter?.id || ''}`)}>开始回信</SecondaryButton></PaperPanel><PaperPanel><Clock3 /><h3>以后再决定</h3><p>回信入口会留在这封信的结尾，不会发送催促。</p><SecondaryButton onClick={() => navigate('/letters')}>稍后再说</SecondaryButton></PaperPanel></div></div>
}

export function IntersectionPage() {
  const { state, actions } = useDemo()
  const [view, setView] = useState<'timeline' | 'compare'>('compare')
  const status = state.exchange.intersectionStatus
  const generate = (fail = false) => {
    actions.setIntersection('loading')
    window.setTimeout(() => actions.setIntersection(fail ? 'error' : 'complete'), 1000)
  }
  if (status === 'ineligible') return <div className="page"><div className="center-state"><span className="state-mark">↔</span><h1>还不能生成视角交汇</h1><p>需要双方最终公开的信件，并且两个人都完成阅读确认。</p><Link to="/demo-control"><SecondaryButton>到 Demo 控制台补齐状态</SecondaryButton></Link></div></div>
  if (status === 'ready') return <div className="page"><div className="intersection-ready"><span className="eyebrow">两封正式信都已经被读完</span><h1>让两个视角在这里轻轻相遇</h1><p>AI 只会读取双方最终公开的信件，不会读取草稿、原音、未公开图片或工作摘要。</p><div><SecondaryButton onClick={() => generate(true)}>演示生成失败</SecondaryButton><PrimaryButton onClick={() => generate()}><Send size={17} /> 生成视角交汇</PrimaryButton></div></div></div>
  if (status === 'loading') return <div className="page"><div className="intersection-loading"><span className="crossing-line a" /><span className="crossing-line b" /><h1>正在让两封信彼此靠近…</h1><p>寻找共同线索，同时保留每个人不同的看见。</p></div></div>
  if (status === 'error') return <div className="page"><div className="center-state"><span className="state-mark">…</span><h1>这次没有交汇成功</h1><p>两封原信保持不变，也没有生成共同记忆。</p><PrimaryButton onClick={() => generate()}><RefreshCcw size={17} /> 重新生成</PrimaryButton></div></div>
  return <div className="page intersection-page"><header className="page-heading inline-heading"><div><span className="eyebrow">同一件事的两个视角</span><h1>那顿没吃完的冬至晚饭</h1><p>这不是裁判，也不是替你们化解什么。只是把已经公开的两封信放在一起看。</p></div><div className="view-switch"><button className={view === 'compare' ? 'active' : ''} onClick={() => setView('compare')}>双视角</button><button className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}>时间线</button></div></header>{view === 'compare' ? <ViewpointComparison /> : <TimelineView />}<PaperPanel className="intersection-summary"><span className="eyebrow">可以一起留下的部分</span><p>一个人把“没有挽留”理解为体谅，另一个人多年后才看见那份没有说出口的等待。两个版本都完整存在，不需要合并成唯一答案。</p><small>来源：丹青与林夏最终确认并公开的两封信</small></PaperPanel><div className="sticky-actions"><SecondaryButton onClick={() => actions.toast('问题反馈已记录，原信不受影响')}>这里有不准确的地方</SecondaryButton><PrimaryButton onClick={() => { actions.saveIntersection(); actions.toast('已保存为共同记忆碎片') }}><Save size={17} /> {state.exchange.intersectionSaved ? '已保存' : '双方保存这次交汇'}</PrimaryButton><Link to={`/exchanges/${state.exchange.id}/memory`}><SecondaryButton>查看记忆碎片</SecondaryButton></Link></div></div>
}

function TimelineView() {
  return <div className="intersection-timeline"><div><span>晚饭前</span><p>林夏很早开始准备晚饭，丹青在房间收拾行李。</p></div><div><span>离开前</span><p>两个人都记得门口，却分别注意到一盏灯和一个笑。</p></div><div><span>门关上后</span><p>一碗汤慢慢凉下；另一个人多年后才重新看见那晚。</p></div></div>
}
