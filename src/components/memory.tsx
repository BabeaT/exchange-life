import { Droplets, LockKeyhole } from 'lucide-react'
import { MessengerCharacter, StoryIllustration } from './characters'
import { PrimaryButton, StatusBanner } from './ui'
import { useDemo } from '../store/DemoContext'

export function ViewpointComparison() {
  return <div className="viewpoint-comparison"><div className="viewpoint a"><span>丹青的视角</span><h3>她记住了门口的灯</h3><p>离开时，她以为自己没有回头。很多年后，那盏灯成了她对那晚最清楚的记忆。</p><blockquote>“我记住的不是离开，而是门口那盏一直亮着的灯。”</blockquote></div><div className="intersection-line"><span>共同记得</span><strong>冬至 · 厨房 · 一顿没吃完的晚饭</strong><i /></div><div className="viewpoint b"><span>林夏的视角</span><h3>她记住了窗边的汤</h3><p>她没有挽留，因为怕耽误那班车。门关上后，多盛的一碗汤在窗边慢慢凉了。</p><blockquote>“我把多盛的那碗汤放在窗边。”</blockquote></div></div>
}

export function MemoryFragment() {
  const { state } = useDemo()
  return <article className="memory-fragment"><StoryIllustration variant={1} label="共同记忆代表插图" /><div><span className="eyebrow">共同记忆碎片 · 001</span><h2>那顿没吃完的冬至晚饭</h2><p>两个人都记得离开的那一刻，却一个留下了门口的灯，一个留下了窗边的汤。没有谁的版本覆盖另一个。</p><div className="fragment-meta"><span>故事时间：很多年前的冬至</span><span>交换完成：2026 年 7 月</span><span>{state.users['user-a'].name} × {state.users['user-b'].name}</span></div></div></article>
}

export function MemoryTreeNode({ active = false, label, onClick }: { active?: boolean; label: string; onClick?: () => void }) {
  return <button className={`tree-node ${active ? 'active' : ''}`} onClick={onClick} aria-label={`打开记忆：${label}`}><span className="fruit" /><small>{label}</small></button>
}

export function MemoryTree() {
  const { state } = useDemo()
  const complete = state.exchange.intersectionSaved
  return <div className={`memory-tree ${complete ? 'grown' : 'young'}`} role="img" aria-label="双方共同的记忆树"><div className="tree-crown crown-a" /><div className="tree-crown crown-b" /><div className="tree-trunk trunk-a" /><div className="tree-trunk trunk-b" /><div className="tree-roots" /><div className="tree-soil" />{complete ? <MemoryTreeNode active label="冬至晚饭" /> : <div className="tree-lock"><LockKeyhole size={18} /><span>完成一次双向交汇后，第一颗记忆会在这里长出。</span></div>}</div>
}

export function WateringInteraction() {
  const { state, actions } = useDemo()
  const watered = state.exchange.wateredBy.includes(state.activeUserId)
  const both = state.exchange.wateredBy.length === 2
  return <div className="watering"><div className="watering-characters"><MessengerCharacter variant="moss" size="small" mood={watered ? 'happy' : 'quiet'} /><MessengerCharacter variant="cloud" size="small" mood={both ? 'happy' : 'quiet'} /></div><div><h3>{both ? '两束微光在根系间相遇了' : watered ? '你已经轻轻浇过水' : '要为这段记忆浇一点水吗？'}</h3><p>没有任务、连续天数或惩罚。树不会因为没有浇水而枯萎。</p></div>{both ? <StatusBanner tone="success">双方都浇过水，新的叶子悄悄长出来了。</StatusBanner> : <PrimaryButton disabled={watered} onClick={() => { actions.water(); actions.toast('这一点照料已经留在共同记忆里') }}><Droplets size={17} /> {watered ? '已经浇过水' : '轻轻浇水'}</PrimaryButton>}</div>
}
