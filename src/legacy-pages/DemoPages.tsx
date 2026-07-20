import { AlertTriangle, ArrowRight, Check, Clock3, Copy, Database, Eye, Leaf, LoaderCircle, Mail, Play, RefreshCcw, RotateCcw, Send, Sparkles, UserRound, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MessengerCharacter, StoryIllustration } from '../components/characters'
import { LoadingState, PrimaryButton, SecondaryButton, StatusBanner } from '../components/ui'
import { useDemo } from '../store/DemoContext'

export function DemoControlPage() {
  const { state, actions } = useDemo()
  const navigate = useNavigate()
  const active = state.users[state.activeUserId]
  const bothRead = state.exchange.letters.length >= 2 && state.exchange.letters.every(item => item.status === 'read')
  const action = (fn: () => void, message: string) => { fn(); actions.toast(message) }
  const loadDeliveredLetters = () => {
    actions.seedBothLetters()
    actions.toast('双方正式信件已送达，等待分别阅读')
  }
  const markBothRead = () => {
    state.exchange.letters.forEach(item => actions.markRead(item.id))
    actions.toast('双方阅读已完成')
  }

  return <main className="demo-control-page">
    <header><div><span className="eyebrow">仅用于开发演示 · 不出现在正式导航</span><h1>Demo 控制台</h1><p>在一台电脑上切换两位用户，快速推进完整交换状态。</p></div><Link to="/letters"><PrimaryButton>进入产品 <ArrowRight size={17} /></PrimaryButton></Link></header>
    <StatusBanner tone="warning">所有数据只保存在当前浏览器 localStorage，不连接真实用户或后端。</StatusBanner>
    <section className="demo-users"><h2>当前演示身份</h2><div><button className={state.activeUserId === 'user-a' ? 'active' : ''} onClick={() => actions.setActiveUser('user-a')}><span className="avatar-large">{state.users['user-a'].avatar}</span><div><strong>{state.users['user-a'].name}</strong><small>用户甲 · 发起人</small></div>{state.activeUserId === 'user-a' && <Check />}</button><button className={state.activeUserId === 'user-b' ? 'active' : ''} onClick={() => actions.setActiveUser('user-b')}><span className="avatar-large">{state.users['user-b'].avatar}</span><div><strong>{state.users['user-b'].name}</strong><small>用户乙 · 受邀人</small></div>{state.activeUserId === 'user-b' && <Check />}</button></div><p>当前操作身份：<strong>{active.name}</strong></p></section>
    <section><h2>快速场景</h2><div className="demo-scenario-grid">
      <ControlCard icon={<Users />} title="创建测试用户" description="恢复甲、乙两位隔离用户" onClick={() => action(actions.reset, '测试用户已恢复')} />
      <ControlCard icon={<Copy />} title="生成邀请" description={`邀请码 ${state.exchange.code}`} onClick={() => navigate(`/exchanges/${state.exchange.id}/invite`)} />
      <ControlCard icon={<UserRound />} title="模拟对方加入" description={state.exchange.joined ? '已经加入' : '等待加入'} onClick={() => action(() => actions.updateExchange({ joined: true }), '用户乙已加入')} />
      <ControlCard icon={<ArrowRight />} title="切换交换方式" description={state.exchange.method === 'independent' ? '当前：双方独立表达' : '当前：我先告诉对方'} onClick={() => action(() => actions.updateExchange({ method: state.exchange.method === 'independent' ? 'tell-first' : 'independent', deliveryMode: 'immediate' }), state.exchange.method === 'independent' ? '已切换为“我先告诉对方”' : '已切换为“双方独立表达”')} />
      <ControlCard icon={<Sparkles />} title="加载双方原始表达" description="载入两份仅本人可见的口语原稿" onClick={() => action(actions.seedBothDrafts, '双方私人原始表达已载入')} />
      <ControlCard icon={<Send />} title="模拟双方发送" description={`${state.exchange.letters.length} / 2 封正式信`} onClick={loadDeliveredLetters} />
      <ControlCard icon={<Clock3 />} title="到达约定时间" description="释放托管或定时信件" onClick={() => action(actions.deliverLetters, '已经到达约定时间')} />
      <ControlCard icon={<Eye />} title="模拟阅读完成" description="推进双向已读条件" disabled={state.exchange.letters.length < 2} onClick={markBothRead} />
      <ControlCard icon={<Mail />} title="模拟表情回应" description="发送“我看见了”" onClick={() => { const incoming = state.exchange.letters.find(item => item.recipientId === state.activeUserId); if (incoming) action(() => actions.reactToLetter(incoming.id, '我看见了'), '回应已发送'); else actions.toast('请先加载示例信件') }} />
      <ControlCard icon={<Leaf />} title="生成视角交汇" description={bothRead ? state.exchange.intersectionStatus : '需要双方完成阅读'} disabled={!bothRead || state.exchange.intersectionStatus === 'complete'} onClick={() => action(() => actions.setIntersection('complete'), '视角交汇已生成')} />
      <ControlCard icon={<Database />} title="生成记忆碎片" description={state.exchange.memoryCreated ? '已生成' : '需要先生成交汇'} disabled={state.exchange.intersectionStatus !== 'complete' || state.exchange.memoryCreated} onClick={() => action(actions.createMemoryFragment, '共同记忆碎片已生成')} />
      <ControlCard icon={<Leaf />} title="保存到记忆树" description={state.exchange.intersectionSaved ? '已保存' : '需要先生成碎片'} disabled={!state.exchange.memoryCreated || state.exchange.intersectionSaved} onClick={() => action(actions.saveMemoryToTree, '记忆碎片已保存到记忆树')} />
      <ControlCard icon={<Database />} title="完整示例故事" description="一键加载可演示终态" onClick={() => action(actions.loadSample, '完整示例故事已加载')} />
    </div></section>
    <section className="demo-state"><h2>当前状态快照</h2><pre>{JSON.stringify({ activeUser: state.activeUserId, joined: state.exchange.joined, narrativeType: state.exchange.narrativeType, method: state.exchange.method, letters: state.exchange.letters.map(item => ({ sender: item.senderId, status: item.status, reaction: item.reaction })), intersection: state.exchange.intersectionStatus, memoryCreated: state.exchange.memoryCreated, savedToTree: state.exchange.intersectionSaved, wateredBy: state.exchange.wateredBy }, null, 2)}</pre></section>
    <footer><button className="danger-button" onClick={() => { if (window.confirm('确定重置全部本地 Demo 数据吗？')) actions.reset() }}><RotateCcw size={17} /> 重置全部 Demo 数据</button><span>刷新页面后仍会保留当前状态。</span></footer>
  </main>
}

function ControlCard({ icon, title, description, onClick, disabled = false }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; disabled?: boolean }) {
  return <button className="control-card" onClick={onClick} disabled={disabled}><span>{icon}</span><div><strong>{title}</strong><small>{description}</small></div><Play size={15} /></button>
}

export function DevStyleLabPage() {
  return <div className="page style-lab"><header className="page-heading"><span className="eyebrow">Style Lab</span><h1>雾感纸本绘本 × 柔软抽象角色</h1><p>开发使用的原创设计系统样本，不直接复制参考图中的角色或构图。</p></header><section><h2>颜色与纸面</h2><div className="swatches">{[['纸张背景','#F3F0EA'],['纸张表面','#FAF8F3'],['雾蓝','#CAD5D6'],['灰粉','#D9BDBD'],['柔紫','#BDB4C3'],['鼠尾草','#ADB89F'],['暖赭','#C4A277'],['暖棕','#6B5548']].map(([name,color]) => <div key={name}><span style={{ background: color }} /><strong>{name}</strong><code>{color}</code></div>)}</div></section><section><h2>角色与插图</h2><div className="lab-characters"><MessengerCharacter variant="moss" size="large" /><MessengerCharacter variant="cloud" size="large" /><MessengerCharacter variant="ember" size="large" /><MessengerCharacter variant="pebble" size="large" /><StoryIllustration variant={0} /><StoryIllustration variant={1} /></div></section><section><h2>关键状态</h2><div className="lab-states"><StatusBanner>内容正在自动保存</StatusBanner><StatusBanner tone="success">本人确认完成</StatusBanner><StatusBanner tone="warning">等待对方完成</StatusBanner><StatusBanner tone="error">AI 生成失败，可以重试</StatusBanner><LoadingState label="正在整理一段故事…" /></div></section><section><h2>按钮层级</h2><div className="lab-buttons"><PrimaryButton>主要操作</PrimaryButton><SecondaryButton>次要操作</SecondaryButton><PrimaryButton disabled>暂不可用</PrimaryButton></div></section></div>
}

export function SystemStatePage({ type }: { type: 'loading' | 'network' | 'forbidden' | 'not-found' }) {
  const content = {
    loading: [<LoaderCircle />, '正在准备这段交换', '内容会在加载完成后继续出现。'],
    network: [<AlertTriangle />, '网络好像走远了一点', '你的本地内容已经保留，可以稍后重试。'],
    forbidden: [<Eye />, '你没有查看这里的权限', '私人草稿和托管中的信件只对内容本人开放。'],
    'not-found': [<RefreshCcw />, '这一页没有留下痕迹', '链接可能已经失效，或页面从未存在。'],
  }[type]
  return <div className="page"><div className="center-state"><span className="state-mark">{content[0]}</span><h1>{content[1]}</h1><p>{content[2]}</p><Link to="/letters"><PrimaryButton>返回我的信件</PrimaryButton></Link></div></div>
}
