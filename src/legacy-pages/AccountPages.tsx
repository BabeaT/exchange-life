import { ArrowRight, BookOpen, ChevronRight, FileText, Image, LogOut, Mail, Mic, Moon, Settings, ShieldCheck, Sparkles, UserRound, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessengerCharacter } from '../components/characters'
import { EmptyState, PaperPanel, PrimaryButton, SecondaryButton, TextField } from '../components/ui'
import { useDemo } from '../store/DemoContext'

export function PersonalSpacePage() {
  const { state } = useDemo()
  const user = state.users[state.activeUserId]
  const draft = state.exchange.drafts[state.activeUserId]
  const sent = state.exchange.letters.filter(item => item.senderId === state.activeUserId)
  const received = state.exchange.letters.filter(item => item.recipientId === state.activeUserId)
  return <div className="page personal-page"><header className="profile-hero"><div className="avatar-hero">{user.avatar}</div><div><span className="eyebrow">个人空间</span><h1>{user.name} 的收纳处</h1><p>原始材料、私人草稿和正式信件分别保存，不会混在一起公开。</p></div><Link to="/settings"><SecondaryButton><Settings size={16} /> 设置</SecondaryButton></Link></header><div className="personal-stats"><PaperPanel><strong>1</strong><span>发起的交换</span></PaperPanel><PaperPanel><strong>{sent.length}</strong><span>寄出的信</span></PaperPanel><PaperPanel><strong>{received.length}</strong><span>收到的信</span></PaperPanel><PaperPanel><strong>{state.exchange.intersectionSaved ? 1 : 0}</strong><span>共同记忆</span></PaperPanel></div><section className="personal-section"><div className="section-title"><div><span className="eyebrow">只属于你</span><h2>原始表达与草稿</h2></div><ShieldCheck size={22} /></div>{draft.rawText || draft.media.length ? <div className="private-materials"><PaperPanel><FileText /><div><h3>文字草稿</h3><p>{draft.rawText.slice(0, 90)}{draft.rawText.length > 90 ? '…' : ''}</p><small>最后保存：{draft.savedAt || '刚刚'}</small></div><Link to={`/exchanges/${state.exchange.id}/write`}>打开</Link></PaperPanel>{draft.media.map(item => <PaperPanel key={item.id}>{item.kind === 'audio' ? <Mic /> : <Image />}<div><h3>{item.name}</h3><p>{item.transcript}</p><small>仅本人可见</small></div></PaperPanel>)}</div> : <EmptyState title="还没有私人材料" description="开始表达后，原始文字、录音和图片会收纳在这里。" />}</section><section className="personal-section"><div className="section-title"><div><span className="eyebrow">交换记录</span><h2>信件与完成的故事</h2></div></div><div className="account-links"><Link to="/letters"><Mail />我的信件<span>{sent.length + received.length} 封</span><ChevronRight /></Link><Link to={`/exchanges/${state.exchange.id}`}><BookOpen />进行中的交换<span>{state.exchange.title}</span><ChevronRight /></Link><Link to="/memory-tree"><Sparkles />共同记忆树<span>{state.exchange.intersectionSaved ? '1 个节点' : '等待第一片记忆'}</span><ChevronRight /></Link></div></section><PaperPanel className="privacy-summary"><ShieldCheck /><div><h3>你的私人内容不会自动变成共同内容</h3><p>原始录音、图片、草稿、转写和 AI 工作摘要默认仅本人可见。正式信件也必须由本人确认后才能寄出。</p></div><Link to="/settings">查看隐私说明</Link></PaperPanel></div>
}

export function SettingsPage() {
  const { state, actions } = useDemo()
  const user = state.users[state.activeUserId]
  const [name, setName] = useState(user.name)
  const navigate = useNavigate()
  return <div className="page settings-page"><header className="page-heading"><span className="eyebrow">设置</span><h1>让这里更适合你</h1></header><div className="settings-layout"><nav className="settings-nav"><a href="#profile">个人资料</a><a href="#messenger">记忆信使</a><a href="#reading">朗读与动态</a><a href="#privacy">隐私</a></nav><main><PaperPanel id="profile"><div className="settings-title"><UserRound /><div><h2>个人资料</h2><p>对方会在邀请和信件中看到这些信息。</p></div></div><TextField label="昵称" value={name} onChange={e => setName(e.target.value)} /><SecondaryButton onClick={() => { actions.updateProfile(name, name.slice(0, 1)); actions.toast('个人资料已保存') }}>保存资料</SecondaryButton></PaperPanel><PaperPanel id="messenger"><div className="settings-title"><Sparkles /><div><h2>记忆信使</h2><p>用于陪伴表达、送信和专属回应。</p></div></div><div className="current-messenger"><MessengerCharacter variant={user.messenger} size="medium" /><div><strong>你现在的信使</strong><p>柔软、安静，不替你说话。</p></div><Link to="/messenger"><SecondaryButton>更换或测试</SecondaryButton></Link></div></PaperPanel><PaperPanel id="reading"><div className="settings-title"><Volume2 /><div><h2>朗读与动态效果</h2><p>声音永远由你主动开启。</p></div></div><label className="setting-row"><span><Moon />减少动态效果</span><input type="checkbox" checked={state.settings.reducedMotion} onChange={e => actions.toast(e.target.checked ? '已使用静态动效偏好' : '已恢复轻量动效')} /></label><label className="field"><span>默认朗读声音</span><select defaultValue={state.settings.narrationVoice}><option value="warm">温暖中性声</option><option value="female">成熟女声</option><option value="male">成熟男声</option></select></label></PaperPanel><PaperPanel id="privacy"><div className="settings-title"><ShieldCheck /><div><h2>隐私说明</h2><p>清楚区分私人材料、正式信件和共同记忆。</p></div></div><ul className="privacy-list"><li><strong>仅本人：</strong>原始文字、录音、转写、图片、草稿和 AI 摘要</li><li><strong>送达后双方：</strong>本人确认过的正式信件和主动公开附件</li><li><strong>共同记忆：</strong>双方正式信件、交汇结果和共同碎片</li></ul></PaperPanel><button className="logout-button" onClick={() => { actions.logout(); navigate('/') }}><LogOut size={17} /> 退出演示账号</button></main></div></div>
}

export function MessengerPage() {
  const { state, actions } = useDemo()
  const current = state.users[state.activeUserId]
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState<'moss' | 'cloud' | 'ember' | 'pebble'>(current.messenger)
  const options = [
    ['moss', '苔团', '喜欢从具体的画面慢慢想起'],
    ['cloud', '云团', '习惯先听一会儿，再轻轻回应'],
    ['ember', '暖点', '常从一句没有说完的话开始'],
    ['pebble', '石子', '愿意把零散细节慢慢排好'],
  ] as const
  return <div className="page messenger-page"><header className="page-heading"><span className="eyebrow">个人形象 · 非心理测试</span><h1>选一个陪你送信的小家伙</h1><p>没有优劣，也不会影响 AI 对故事的判断。</p></header>{step === 0 ? <PaperPanel className="messenger-quiz"><span>1 / 2</span><h2>当一段回忆忽然回来时，你通常先注意到什么？</h2><div><button onClick={() => setStep(1)}>一个很具体的画面</button><button onClick={() => setStep(1)}>一句当时没有说完的话</button><button onClick={() => setStep(1)}>身体里很轻的一种感觉</button><button onClick={() => setStep(1)}>我想先安静一会儿</button></div><button className="skip-quiz" onClick={() => setStep(1)}>跳过测试，直接选择</button></PaperPanel> : <><div className="messenger-options">{options.map(([id, name, copy]) => <button key={id} className={choice === id ? 'selected' : ''} onClick={() => setChoice(id)}><MessengerCharacter variant={id} size="medium" /><strong>{name}</strong><p>{copy}</p><span>{choice === id ? '已选择' : '看看我'}</span></button>)}</div><PaperPanel className="messenger-note"><strong>推荐：{options.find(item => item[0] === choice)?.[1]}</strong><p>这只是表达偏好的轻量匹配，不是 MBTI 或心理诊断。你随时可以更换。</p></PaperPanel><div className="sticky-actions"><SecondaryButton onClick={() => setStep(0)}>重新测试</SecondaryButton><PrimaryButton onClick={() => actions.toast('记忆信使已保存')}>确认这个形象 <ArrowRight size={17} /></PrimaryButton></div></>}</div>
}
