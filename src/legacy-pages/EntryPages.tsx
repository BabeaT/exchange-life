import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Plus, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MistScene } from '../components/characters'
import { PaperPanel, PrimaryButton, StatusBanner, TextField } from '../components/ui'
import { useDemo } from '../store/DemoContext'

export function BrandPage() {
  return <main className="brand-page"><MistScene /><div className="brand-copy"><span className="eyebrow">双人叙事 · 视角转换 · 共同记忆</span><h1>交换人生</h1><p className="brand-statement"><span>我的话语，一半毫无意义；</span><span>但我说出来，<wbr />是为了让另一半能够抵达你。</span></p><Link to="/start" className="enter-link">推开门，慢慢说 <ArrowRight size={18} /></Link></div></main>
}

export function StartPage() {
  const { state } = useDemo()
  return <main className="centered-page start-page"><Link to="/" className="back-link"><ArrowLeft size={16} /> 回到门外</Link><header className="page-heading"><span className="eyebrow">今天想从哪里开始？</span></header><div className="entry-choice-grid"><Link to={state.authenticated ? '/exchanges/new' : '/auth?next=/exchanges/new'} className="entry-choice"><span className="entry-icon ochre"><Plus /></span><div><h2>创建一次交换</h2><p>选择一件共同经历，或把自己的一段人生告诉对方。</p></div><ArrowRight /></Link><Link to="/join" className="entry-choice"><span className="entry-icon lavender"><KeyRound /></span><div><h2>输入邀请码</h2><p>加入一位熟悉的人为你留下的双人空间。</p></div><ArrowRight /></Link></div></main>
}

export function AuthPage() {
  const { state, actions } = useDemo()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [email, setEmail] = useState('demo@exchange.life')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const error = email && !email.includes('@') ? '请输入有效的邮箱地址' : ''
  const submit = () => {
    if (!email || !password || error) return
    setLoading(true)
    window.setTimeout(() => {
      actions.login()
      navigate(mode === 'register' ? `/profile?next=${encodeURIComponent(params.get('next') || '/letters')}` : params.get('next') || '/letters')
    }, 700)
  }
  return <main className="auth-page"><section className="auth-aside"><MistScene /><div><span className="eyebrow">你的内容会被好好保管</span><h1>先认出你，<br />再继续那段故事。</h1><p>这是本地 Demo 登录。不会发送短信，也不会连接真实账号。</p></div></section><section className="auth-form"><Link to="/start" className="back-link"><ArrowLeft size={16} /> 返回</Link><div className="auth-tabs"><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>第一次来</button><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>已有账号</button></div><h2>{mode === 'register' ? '创建一个本地演示账号' : '欢迎回来'}</h2><TextField label="邮箱" value={email} onChange={e => setEmail(e.target.value)} error={error} /><TextField label="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} hint="Demo 中不会发送到任何服务" /><PrimaryButton disabled={loading || Boolean(error)} onClick={submit}>{loading ? '正在保存…' : mode === 'register' ? '继续创建资料' : '登录并继续'} <ArrowRight size={17} /></PrimaryButton>{state.authenticated && <StatusBanner tone="success">当前已有演示会话，也可以直接进入我的信件。</StatusBanner>}</section></main>
}

export function ProfilePage() {
  const { state, actions } = useDemo()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const current = state.users[state.activeUserId]
  const [name, setName] = useState(current.name)
  const [avatar, setAvatar] = useState(current.avatar)
  const avatars = ['丹', '林', '禾', '云', '川']
  const [saved, setSaved] = useState(false)
  const submit = () => {
    if (!name.trim()) return
    actions.updateProfile(name.trim(), avatar)
    setSaved(true)
    window.setTimeout(() => navigate(params.get('next') || '/letters'), 500)
  }
  return <main className="centered-page profile-page"><div className="narrow-content"><span className="eyebrow">只需要一点点信息</span><h1>让对方知道，是你来了</h1><p>昵称会出现在邀请、信件署名和共同记忆中。</p><PaperPanel><label className="field"><span>选择头像</span><div className="avatar-options">{avatars.map(item => <button key={item} className={avatar === item ? 'selected' : ''} onClick={() => setAvatar(item)} aria-label={`选择头像${item}`}>{item}</button>)}<button className="avatar-upload" aria-label="上传头像"><UserRound size={18} /> 上传</button></div></label><TextField label="昵称" value={name} onChange={e => setName(e.target.value)} error={!name.trim() ? '请告诉对方怎么称呼你' : undefined} hint="这是对方在交换中看见的名字" /><PrimaryButton onClick={submit} disabled={!name.trim()}>{saved ? <><CheckCircle2 size={17} /> 已保存</> : '保存并继续'}</PrimaryButton></PaperPanel></div></main>
}

type InviteState = 'idle' | 'checking' | 'valid' | 'invalid' | 'expired' | 'joined'

export function JoinPage() {
  const { state, actions } = useDemo()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get('code') || ''
  const [code, setCode] = useState(initial)
  const [status, setStatus] = useState<InviteState>(initial ? 'checking' : 'idle')
  useMemo(() => {
    if (initial) window.setTimeout(() => setStatus(initial.toUpperCase() === state.exchange.code ? 'valid' : 'invalid'), 500)
  }, [initial, state.exchange.code])
  const check = () => {
    setStatus('checking')
    window.setTimeout(() => {
      const value = code.toUpperCase()
      setStatus(value === state.exchange.code ? 'valid' : value === 'EXPIRED' ? 'expired' : value === 'JOINED' ? 'joined' : 'invalid')
    }, 650)
  }
  const join = () => {
    actions.updateExchange({ joined: true })
    if (!state.authenticated) navigate(`/auth?next=${encodeURIComponent(`/exchanges/${state.exchange.id}/context`)}`)
    else navigate(`/exchanges/${state.exchange.id}/context`)
  }
  return <main className="centered-page join-page"><Link to="/start" className="back-link"><ArrowLeft size={16} /> 返回</Link><div className="narrow-content"><span className="eyebrow">来自熟悉的人</span><h1>输入邀请码</h1><p>邀请码只用于加入指定的双人空间，不会把你带到公开社交场所。</p><PaperPanel className="invite-checker"><TextField label="8 位邀请码" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setStatus('idle') }} placeholder={`试试 ${state.exchange.code}`} maxLength={8} /><PrimaryButton onClick={check} disabled={!code || status === 'checking'}>{status === 'checking' ? '正在确认…' : '确认邀请码'}</PrimaryButton>{status === 'valid' && <InvitationPreview onJoin={join} />}{status === 'invalid' && <StatusBanner tone="error">没有找到这个邀请码，请检查字母和数字。</StatusBanner>}{status === 'expired' && <StatusBanner tone="warning">这枚邀请码已经失效，请联系邀请人重新生成。</StatusBanner>}{status === 'joined' && <StatusBanner tone="info">你已经加入过这次交换，可以直接进入我的信件。</StatusBanner>}</PaperPanel><div className="invite-demo-codes"><span>演示状态：</span><button onClick={() => setCode(state.exchange.code)}>有效</button><button onClick={() => setCode('EXPIRED')}>已失效</button><button onClick={() => setCode('JOINED')}>已加入</button><button onClick={() => setCode('WRONG000')}>无效</button></div></div></main>
}

function InvitationPreview({ onJoin }: { onJoin: () => void }) {
  return <div className="invitation-preview"><div className="inviter"><span className="avatar-large">丹</span><div><small>丹青邀请你</small><strong>一起回看：我离开家的那一年</strong></div></div><p>“离开之前，我们说了很多，却没有真正说出自己在害怕什么。”</p><div className="invitation-meta"><span>共同事件</span><span>双方独立表达</span><span>只对你们两人开放</span></div><PrimaryButton onClick={onJoin}>确认加入 <ArrowRight size={17} /></PrimaryButton></div>
}
