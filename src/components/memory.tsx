import { Droplets, LockKeyhole } from 'lucide-react'
import { MessengerCharacter, StoryPhoto } from './characters'
import { PrimaryButton, StatusBanner } from './ui'
import { useDemo } from '../store/DemoContext'
import { modeAEventNodes } from '../data/modeAStory'

export function ViewpointComparison() {
  return <div className="mode-a-nodes">{modeAEventNodes.map((node, index) => <article className="mode-a-node" key={node.title}><header><span>节点 {index + 1}</span><h2>{node.title}</h2></header><div className="mode-a-node-visual"><StoryPhoto src={node.image} alt={`${node.title}的叙事插图`} /><div><div className="mode-a-perspectives"><section className="viewpoint a"><span>林夏的视角</span><p>{node.linxia}</p></section><section className="viewpoint b"><span>丹青的视角</span><p>{node.danqing}</p></section></div><dl className="node-reading"><div><dt>共同事实</dt><dd>{node.fact}</dd></div><div><dt>不同理解</dt><dd>{node.difference}</dd></div><div><dt>当时没有看见</dt><dd>{node.unseen}</dd></div></dl></div></div></article>)}</div>
}

export function MemoryFragment() {
  const { state } = useDemo()
  return <article className="memory-fragment"><StoryPhoto src="/demo/story-1/image12.png" alt="母女过去与现在的记忆在雾中交叠，两个身影彼此望见的水彩插图" caption="离开没有让共同生活消失，它只是让两个人从另一边重新看见彼此。" /><div><span className="eyebrow">共同记忆碎片 · 001</span><h2>两个没有说出口的害怕</h2><p><strong>共同事实：</strong>两个人都支持这次离开，也都担心离开会改变彼此的关系。</p><p><strong>仍然存在的不同：</strong>林夏需要的是信任与独立空间；丹青仍然会担心，只是在学习改变表达关心的方式。</p><blockquote>“沉默并不只属于自己。”</blockquote><div className="fragment-meta"><span>关联事件：我离开家的那一年</span><span>故事时间：2024年8月</span><span>共同物件：装着药、腊肉和童年零食的行李箱</span><span>{state.users['user-b'].name} × {state.users['user-a'].name}</span></div></div></article>
}

export function MemoryTreeNode({ active = false, label, onClick }: { active?: boolean; label: string; onClick?: () => void }) {
  return <button className={`tree-node ${active ? 'active' : ''}`} onClick={onClick} aria-label={`打开记忆：${label}`}><span className="fruit" /><small>{label}</small></button>
}

export function MemoryTree({ onOpenMemory }: { onOpenMemory?: () => void }) {
  const { state } = useDemo()
  const complete = state.exchange.intersectionSaved
  return <div className={`memory-tree ${complete ? 'grown' : 'young'}`} role="img" aria-label="双方共同的记忆树"><div className="tree-crown crown-a" /><div className="tree-crown crown-b" /><div className="tree-trunk trunk-a" /><div className="tree-trunk trunk-b" /><div className="tree-roots" /><div className="tree-soil" />{complete ? <MemoryTreeNode active label="离开家的那一年" onClick={onOpenMemory} /> : <div className="tree-lock"><LockKeyhole size={18} /><span>完成一次双向交汇后，第一颗记忆会在这里长出。</span></div>}</div>
}

export function WateringInteraction() {
  const { state, actions } = useDemo()
  const watered = state.exchange.wateredBy.includes(state.activeUserId)
  const both = state.exchange.wateredBy.length === 2
  return <div className="watering"><div className="watering-characters"><MessengerCharacter variant="moss" size="small" mood={watered ? 'happy' : 'quiet'} /><MessengerCharacter variant="cloud" size="small" mood={both ? 'happy' : 'quiet'} /></div><div><h3>{both ? '两束微光在根系间相遇了' : watered ? '你已经轻轻浇过水' : '要为这段记忆浇一点水吗？'}</h3><p>没有任务、连续天数或惩罚。树不会因为没有浇水而枯萎。</p></div>{both ? <StatusBanner tone="success">双方都浇过水，新的叶子悄悄长出来了。</StatusBanner> : <PrimaryButton disabled={watered} onClick={() => { actions.water(); actions.toast('这一点照料已经留在共同记忆里') }}><Droplets size={17} /> {watered ? '已经浇过水' : '轻轻浇水'}</PrimaryButton>}</div>
}
