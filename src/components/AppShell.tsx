import { BookOpen, Home, Leaf, Mail, Menu, Plus, Settings, Sparkles, UserRound, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useDemo } from '../store/DemoContext'

const nav = [
  { to: '/home', label: '交换首页', icon: Home },
  { to: '/exchanges/new', label: '创建交换', icon: Plus },
  { to: '/letters', label: '我的信件', icon: Mail },
  { to: '/memory-tree', label: '共同记忆', icon: Leaf },
  { to: '/space', label: '个人空间', icon: UserRound },
]

export function Header({ onMenu }: { onMenu: () => void }) {
  const { state } = useDemo()
  const user = state.users[state.activeUserId]
  return <header className="app-header"><button className="icon-button mobile-menu" onClick={onMenu} aria-label="打开导航"><Menu /></button><NavLink to="/home" className="wordmark"><span className="wordmark-mark">交</span><span>交换人生</span></NavLink><div className="header-spacer" /><span className="demo-tag">本地演示</span><NavLink className="user-chip" to="/settings"><span className="avatar-small">{user.avatar}</span><span>{user.name}</span></NavLink></header>
}

export function SideNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <aside className={`side-nav ${open ? 'open' : ''}`} aria-label="主要导航"><button className="icon-button side-close" onClick={onClose} aria-label="关闭导航"><X /></button><div className="side-intro"><span className="eyebrow">双人叙事空间</span><p>把各自看见的，轻轻交给彼此。</p></div><nav>{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} /><span>{label}</span></NavLink>)}</nav><div className="side-bottom"><NavLink to="/style-lab"><Sparkles size={17} />风格实验室</NavLink><NavLink to="/settings"><Settings size={17} />设置</NavLink><p><BookOpen size={15} /> 原始表达仅自己可见</p></div></aside>
}

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const { state } = useDemo()
  const location = useLocation()
  return <div className="app-shell"><Header onMenu={() => setNavOpen(true)} /><SideNavigation open={navOpen} onClose={() => setNavOpen(false)} /><main className="app-main" key={location.pathname}><Outlet /></main>{state.toast && <div className="toast" role="status">{state.toast}</div>}</div>
}
