import { Leaf, Mail, Menu, Plus, Settings, Sparkles, UserRound, X } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useDemo } from '../store/DemoContext'

const nav = [
  { to: '/exchanges/new', label: '创建交换', icon: Plus },
  { to: '/letters', label: '我的信件', icon: Mail },
  { to: '/memory-tree', label: '共同记忆', icon: Leaf },
  { to: '/space', label: '个人空间', icon: UserRound },
  { to: '/style-lab', label: '风格实验室', icon: Sparkles },
  { to: '/settings', label: '设置', icon: Settings },
]

export function Header({ onMenu }: { onMenu: () => void }) {
  const { state } = useDemo()
  const user = state.users[state.activeUserId]
  return <header className="app-header"><button className="icon-button mobile-menu" onClick={onMenu} aria-label="打开导航"><Menu /></button><NavLink to="/letters" className="wordmark"><span className="wordmark-mark">交</span><span>交换人生</span></NavLink><div className="header-spacer" /><span className="demo-tag">本地演示</span><NavLink className="user-chip" to="/settings"><span className="avatar-small">{user.avatar}</span><span>{user.name}</span></NavLink></header>
}

export function SideNavigation({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useDemo()
  const navItems = state.exchange.intersectionStatus === 'ready'
    ? [...nav, { to: `/exchanges/${state.exchange.id}/convergence`, label: '进入视角交汇', icon: Sparkles }]
    : nav
  return <aside className={`side-nav ${open ? 'open' : ''}`} aria-label="主要导航"><button className="icon-button side-close" onClick={onClose} aria-label="关闭导航"><X /></button><nav>{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} /><span>{label}</span></NavLink>)}</nav></aside>
}

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const { state } = useDemo()
  const location = useLocation()
  return <div className="app-shell"><Header onMenu={() => setNavOpen(true)} /><SideNavigation open={navOpen} onClose={() => setNavOpen(false)} /><main className="app-main" key={location.pathname}><Outlet /></main>{state.toast && <div className="toast" role="status">{state.toast}</div>}</div>
}
