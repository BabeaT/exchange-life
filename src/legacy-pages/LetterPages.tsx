import { ArrowLeft, ArrowRight, Check, Clock3, Heart, Leaf, MailOpen, RefreshCcw, Reply, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DeliveryAnimation } from './deliveryParts'
import { LetterCover, LetterReader } from '../components/letter'
import { ViewpointComparison } from '../components/memory'
import { PaperPanel, PrimaryButton, SecondaryButton } from '../components/ui'
import { reactions } from '../data/demoData'
import { modeAEventNodes, modeAStory } from '../data/modeAStory'
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

function MissingLetter() { return <div className="page"><div className="center-state"><h1>这封信还没有抵达</h1><p>它可能仍在托管，或链接已经失效。</p><Link to="/letters"><PrimaryButton>返回我的信件</PrimaryButton></Link></div></div> }

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
  return <div className="page reaction-page"><header className="page-heading"><span className="eyebrow">不用急着说很多</span><h1>你想怎样收下这封信？</h1><p>选择一个最接近此刻的动作。它不是聊天，也不会形成无限消息流。</p></header><div className="reaction-grid">{reactions.map(item => <button key={item.id} className={selected === item.label ? 'selected' : ''} onClick={() => setSelected(item.label)}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.id === 'thinking' ? '允许自己再慢一点' : '让对方知道你看见了'}</small></button>)}</div><div className="sticky-actions"><button className="subtle-link" onClick={() => navigate('/letters')}>暂时不回应</button><PrimaryButton disabled={!selected} onClick={send}><Heart size={17} /> 发送这个回应</PrimaryButton></div></div>
}

export function ReplyChoicePage() {
  const { state } = useDemo()
  const { letterId } = useParams()
  const letter = state.exchange.letters.find(item => item.id === letterId)
  const navigate = useNavigate()
  const canConverge = state.exchange.intersectionStatus === 'ready' || state.exchange.intersectionStatus === 'complete'
  return <div className="page reply-choice-page"><div className="reply-mark"><Check /></div><span className="eyebrow">回应已经送达</span><h1>{canConverge ? '两个视角都已经抵达' : '这封信可以先停在这里'}</h1><p>{canConverge ? '双方都完成了阅读，现在可以进入视角交汇。' : '你不需要立刻回信。以后准备好时，入口仍会在。'}</p>{canConverge && <PaperPanel><Leaf /><h3>进入视角交汇</h3><p>AI 只会使用双方最终确认并公开的信件。</p><PrimaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/convergence`)}>查看两个视角 <ArrowRight size={17} /></PrimaryButton></PaperPanel>}<div className="reply-options"><PaperPanel><Heart /><h3>先轻轻收下</h3><p>只保留刚才的专属回应，不产生聊天或等待任务。</p><PrimaryButton onClick={() => navigate('/letters')}>就停在这里</PrimaryButton></PaperPanel><PaperPanel><Reply /><h3>我也想写一封回信</h3><p>回信会关联原信，但仍然从你的私人表达空间开始。</p><SecondaryButton onClick={() => navigate(`/exchanges/${state.exchange.id}/write?replyTo=${letter?.id || ''}`)}>开始回信</SecondaryButton></PaperPanel><PaperPanel><Clock3 /><h3>以后再决定</h3><p>回信入口会留在这封信的结尾，不会发送催促。</p><SecondaryButton onClick={() => navigate('/letters')}>稍后再说</SecondaryButton></PaperPanel></div></div>
}

export function IntersectionPage() {
  const { state, actions } = useDemo()
  const [view, setView] = useState<'timeline' | 'compare'>('compare')
  const status = state.exchange.intersectionStatus
  const bothRead = state.exchange.letters.length >= 2 && state.exchange.letters.every(item => item.status === 'read')
  const generate = (fail = false) => {
    if (!bothRead) {
      actions.toast('需要双方完成阅读后才能生成视角交汇')
      return
    }
    actions.setIntersection('loading')
    window.setTimeout(() => actions.setIntersection(fail ? 'error' : 'complete'), 1000)
  }
  if (!bothRead || status === 'ineligible') return <div className="page"><div className="center-state"><span className="state-mark">↔</span><h1>还不能生成视角交汇</h1><p>需要双方最终公开的信件，并且两个人都完成阅读确认。</p><Link to="/demo-control"><SecondaryButton>到 Demo 控制台补齐状态</SecondaryButton></Link></div></div>
  if (status === 'ready') return <div className="page"><div className="intersection-ready"><span className="eyebrow">两封正式信都已经被读完</span><h1>让两个视角在这里轻轻相遇</h1><p>AI 只会读取双方最终公开的信件，不会读取草稿、原音、未公开图片或工作摘要。</p><div><SecondaryButton onClick={() => generate(true)}>演示生成失败</SecondaryButton><PrimaryButton onClick={() => generate()}><Send size={17} /> 生成视角交汇</PrimaryButton></div></div></div>
  if (status === 'loading') return <div className="page"><div className="intersection-loading"><span className="crossing-line a" /><span className="crossing-line b" /><h1>正在让两封信彼此靠近…</h1><p>寻找共同线索，同时保留每个人不同的看见。</p></div></div>
  if (status === 'error') return <div className="page"><div className="center-state"><span className="state-mark">…</span><h1>这次没有交汇成功</h1><p>两封原信保持不变，也没有生成共同记忆。</p><PrimaryButton onClick={() => generate()}><RefreshCcw size={17} /> 重新生成</PrimaryButton></div></div>
  return <div className="page intersection-page"><header className="page-heading inline-heading"><div><span className="eyebrow">AI 双视角交汇 · 仅使用双方确认稿</span><h1>《{modeAStory.intersectionTitle}》</h1><p>这不是裁判，也不要求和解。交汇只把两份已经确认公开的视角放在一起，并允许差异继续存在。</p></div><div className="view-switch"><button className={view === 'compare' ? 'active' : ''} onClick={() => setView('compare')}>五节点对照</button><button className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}>简明时间线</button></div></header>{view === 'compare' ? <ViewpointComparison /> : <TimelineView />}<div className="intersection-findings"><PaperPanel><span className="eyebrow">01 · 共同事实</span><ul><li>林夏接受了深圳的工作。</li><li>两人讨论过工作、住处和安全。</li><li>丹青参与了收拾行李并到车站送别。</li><li>林夏离开后，双方都保持了联系。</li></ul></PaperPanel><PaperPanel><span className="eyebrow">02 · 不同理解</span><ul><li>林夏把反复询问理解为不信任和阻拦。</li><li>丹青把询问当作确认安全和表达关心。</li><li>林夏把站台上的沉默理解为不支持。</li><li>丹青把没有挽留理解为尊重她的决定。</li></ul></PaperPanel><PaperPanel><span className="eyebrow">03 · 当时没有看见的部分</span><ul><li>林夏希望被信任，也害怕承认自己会孤独。</li><li>丹青担心关系和照顾方式发生变化，却不知道怎样直接表达。</li><li>两个人都写过更长的信息，但最后只发送了很短的话。</li></ul></PaperPanel><PaperPanel><span className="eyebrow">04 · 仍然可以保留的不同</span><ul><li>林夏依然需要更明确的信任和空间。</li><li>丹青依然会担心，但可以学习用询问之外的方式表达关心。</li><li>交汇不代表双方必须得到完全相同的结论。</li></ul></PaperPanel></div><PaperPanel className="intersection-summary"><span className="eyebrow">交汇说明</span><p>两个人都在担心离开会改变彼此的关系，只是一个把需要说成了独立，另一个把担心说成了问题。沉默在两边都有不同含义，不需要被合并成唯一答案。</p><small>来源：丹青与林夏本人最终确认并公开的两封信；不包含原始录音、原图或私人转写。</small></PaperPanel><div className="sticky-actions"><SecondaryButton onClick={() => actions.toast('问题反馈已记录，原信不受影响')}>这里有不准确的地方</SecondaryButton>{!state.exchange.memoryCreated ? <PrimaryButton onClick={() => { actions.createMemoryFragment(); actions.toast('共同记忆碎片已形成，等待你查看并保存') }}><Leaf size={17} /> 形成记忆碎片</PrimaryButton> : <Link to={`/exchanges/${state.exchange.id}/memory`}><PrimaryButton>查看记忆碎片 <ArrowRight size={17} /></PrimaryButton></Link>}</div></div>
}

function TimelineView() {
  return <div className="intersection-timeline mode-a-timeline">{modeAEventNodes.map((node, index) => <div key={node.title}><span>{index + 1}</span><h3>{node.title}</h3><p>{node.fact}</p><small>{node.difference}</small></div>)}</div>
}
