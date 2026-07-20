import { ArrowRight, Leaf, LockKeyhole } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MemoryFragment, MemoryTree, WateringInteraction } from '../components/memory'
import { EmptyState, PaperPanel, PrimaryButton, StatusBanner } from '../components/ui'
import { useDemo } from '../store/DemoContext'

export function MemoryFragmentPage() {
  const { state, actions } = useDemo()
  if (!state.exchange.memoryCreated) return <div className="page"><header className="page-heading"><span className="eyebrow">共同记忆碎片</span><h1>它还没有形成</h1></header><EmptyState title="需要先完成一次视角交汇" description="双方读完正式信件并生成交汇后，才能生成共同记忆碎片。" action={<Link to={`/exchanges/${state.exchange.id}/convergence`}><PrimaryButton>查看交汇条件</PrimaryButton></Link>} /></div>
  return <div className="page fragment-page"><header className="page-heading inline-heading"><div><span className="eyebrow">双方共同拥有 · 彼此仍然独立</span><h1>两个没有说出口的害怕</h1><p>这块碎片只在双视角交汇完成后形成。</p></div>{state.exchange.intersectionSaved ? <StatusBanner tone="success">已进入共同记忆树</StatusBanner> : <PrimaryButton onClick={() => { actions.saveMemoryToTree(); actions.toast('记忆碎片已保存到共同记忆树') }}>保存到记忆树</PrimaryButton>}</header><MemoryFragment /><div className="fragment-links"><PaperPanel><span>丹青的正式信件</span><h3>那些没能直接说出的担心</h3><p>只包含丹青本人确认公开的版本，不包含原始素材。</p><Link to="/letters">查看信件 <ArrowRight size={15} /></Link></PaperPanel><PaperPanel><span>林夏的正式信件</span><h3>我想被相信，也想让你知道</h3><p>只包含林夏本人确认公开的版本，不包含原始素材。</p><Link to="/letters">查看信件 <ArrowRight size={15} /></Link></PaperPanel><PaperPanel><span>AI 双视角交汇</span><h3>同一场离开，两种没有说出的害怕</h3><p>来源固定为上面两封本人确认的正式信件。</p><Link to={`/exchanges/${state.exchange.id}/convergence`}>返回交汇结果 <ArrowRight size={15} /></Link></PaperPanel></div><Link to="/memory-tree" className="large-link"><Leaf /> 在共同记忆树上看看它 <ArrowRight /></Link></div>
}

export function MemoryTreePage() {
  const { state } = useDemo()
  const navigate = useNavigate()
  return <div className="page tree-page"><header className="page-heading inline-heading"><div><span className="eyebrow">{state.users['user-a'].name} 与 {state.users['user-b'].name} 的记忆树</span><h1>共享同一片土壤，仍然各自生长</h1><p>记忆不会因为很久没来而枯萎。这里没有任务、积分或排行榜。</p></div><div className="tree-legend"><span><i className="legend-a" />{state.users['user-a'].name} 的一侧</span><span><i className="legend-b" />{state.users['user-b'].name} 的一侧</span></div></header><div className="tree-stage"><MemoryTree onOpenMemory={() => navigate(`/exchanges/${state.exchange.id}/memory`)} />{state.exchange.intersectionSaved && <Link className="tree-fragment-link" to={`/exchanges/${state.exchange.id}/memory`}>打开“离开家的那一年”记忆碎片 <ArrowRight size={15} /></Link>}</div>{state.exchange.intersectionSaved ? <WateringInteraction /> : <PaperPanel className="tree-empty-copy"><LockKeyhole /><h3>这是一棵刚刚发芽的树</h3><p>当双方完成两封信、阅读和视角交汇后，第一颗记忆果实会出现。</p></PaperPanel>}<section className="past-memories"><h2>树上的记忆</h2>{state.exchange.intersectionSaved ? <button className="memory-fragment-button" onClick={() => navigate(`/exchanges/${state.exchange.id}/memory`)}><MemoryFragment /></button> : <EmptyState title="还没有共同记忆" description="你们可以从一次不急着说完的交换开始。" />}</section></div>
}
