import { ArrowRight, Leaf, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MemoryFragment, MemoryTree, WateringInteraction } from '../components/memory'
import { EmptyState, PaperPanel, PrimaryButton, StatusBanner } from '../components/ui'
import { useDemo } from '../store/DemoContext'

export function MemoryFragmentPage() {
  const { state } = useDemo()
  if (!state.exchange.intersectionSaved) return <div className="page"><header className="page-heading"><span className="eyebrow">共同记忆碎片</span><h1>它还没有形成</h1></header><EmptyState title="需要两封信和一次视角交汇" description="单方来信与表情回应会被好好保存，但不会被写成双方共同记忆。" action={<Link to={`/exchanges/${state.exchange.id}/convergence`}><PrimaryButton>查看交汇条件</PrimaryButton></Link>} /></div>
  return <div className="page fragment-page"><header className="page-heading inline-heading"><div><span className="eyebrow">双方共同拥有 · 彼此仍然独立</span><h1>一块新记忆已经形成</h1></div><StatusBanner tone="success">已进入共同记忆树</StatusBanner></header><MemoryFragment /><div className="fragment-links"><PaperPanel><span>丹青的正式信件</span><h3>门口那盏灯</h3><p>只包含丹青本人确认公开的版本。</p><Link to="/letters">查看信件 <ArrowRight size={15} /></Link></PaperPanel><PaperPanel><span>林夏的正式信件</span><h3>窗边那碗汤</h3><p>只包含林夏本人确认公开的版本。</p><Link to="/letters">查看信件 <ArrowRight size={15} /></Link></PaperPanel><PaperPanel><span>AI 视角交汇</span><h3>同一场冬夜里的两种看见</h3><p>来源固定为上面两封正式信件。</p><Link to={`/exchanges/${state.exchange.id}/convergence`}>查看交汇 <ArrowRight size={15} /></Link></PaperPanel></div><Link to="/memory-tree" className="large-link"><Leaf /> 在共同记忆树上看看它 <ArrowRight /></Link></div>
}

export function MemoryTreePage() {
  const { state } = useDemo()
  return <div className="page tree-page"><header className="page-heading inline-heading"><div><span className="eyebrow">{state.users['user-a'].name} 与 {state.users['user-b'].name} 的记忆树</span><h1>共享同一片土壤，仍然各自生长</h1><p>记忆不会因为很久没来而枯萎。这里没有任务、积分或排行榜。</p></div><div className="tree-legend"><span><i className="legend-a" />{state.users['user-a'].name} 的一侧</span><span><i className="legend-b" />{state.users['user-b'].name} 的一侧</span></div></header><div className="tree-stage"><MemoryTree />{state.exchange.intersectionSaved && <Link className="tree-fragment-link" to={`/exchanges/${state.exchange.id}/memory`}>打开“冬至晚饭”记忆 <ArrowRight size={15} /></Link>}</div>{state.exchange.intersectionSaved ? <WateringInteraction /> : <PaperPanel className="tree-empty-copy"><LockKeyhole /><h3>这是一棵刚刚发芽的树</h3><p>当双方完成两封信、阅读和视角交汇后，第一颗记忆果实会出现。</p></PaperPanel>}<section className="past-memories"><h2>树上的记忆</h2>{state.exchange.intersectionSaved ? <MemoryFragment /> : <EmptyState title="还没有共同记忆" description="你们可以从一次不急着说完的交换开始。" />}</section></div>
}
