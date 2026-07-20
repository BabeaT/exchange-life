import { ArrowRight, Check, Palette, RefreshCcw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LetterPreview } from '../components/letter'
import { MessengerCharacter } from '../components/characters'
import { PaperPanel, PrimaryButton, SecondaryButton, StatusBanner } from '../components/ui'
import { getMessengerColorValue, messengerColors, messengerOptions, messengerQuestions, stationeryColors, stationeryTextures } from '../data/personalization'
import { useDemo } from '../store/DemoContext'
import type { DemoPersonalization, DemoUser } from '../types'

type MessengerPhase = 'summary' | 'test' | 'result' | 'choose'

const recommendMessenger = (answers: string[]): DemoUser['messenger'] => {
  const score = [0, 0, 0, 0]
  answers.forEach((answer, questionIndex) => {
    const answerIndex = messengerQuestions[questionIndex]?.answers.indexOf(answer) ?? 0
    score[Math.max(0, answerIndex)] += 1
  })
  return messengerOptions[score.indexOf(Math.max(...score))]?.id || 'moss'
}

export function StyleLabPage() {
  const { state, actions } = useDemo()
  const saved = state.personalization
  const [stationeryColor, setStationeryColor] = useState<DemoPersonalization['stationeryColor']>(saved.stationeryColor)
  const [stationeryTexture, setStationeryTexture] = useState<DemoPersonalization['stationeryTexture']>(saved.stationeryTexture)
  const [phase, setPhase] = useState<MessengerPhase>('summary')
  const [answers, setAnswers] = useState<string[]>(saved.messengerTestAnswers)
  const [messengerType, setMessengerType] = useState<DemoUser['messenger']>(saved.messengerType)
  const [messengerColor, setMessengerColor] = useState<DemoPersonalization['messengerColor']>(saved.messengerColor)
  const recommended = useMemo(() => recommendMessenger(answers), [answers])
  const currentMessenger = messengerOptions.find(item => item.id === saved.messengerType) || messengerOptions[0]
  const currentColor = messengerColors.find(item => item.id === saved.messengerColor) || messengerColors[0]
  const questionIndex = Math.min(answers.length, messengerQuestions.length - 1)
  const question = messengerQuestions[questionIndex]

  const saveStationery = () => {
    actions.updatePersonalization({ stationeryColor, stationeryTexture })
    actions.toast('我的信纸已保存')
  }
  const startTest = () => {
    setAnswers([])
    setPhase('test')
    actions.updatePersonalization({ messengerTestAnswers: [], messengerTestCompleted: false })
  }
  const answerQuestion = (answer: string) => {
    const nextAnswers = [...answers, answer]
    setAnswers(nextAnswers)
    actions.updatePersonalization({ messengerTestAnswers: nextAnswers })
    if (nextAnswers.length === messengerQuestions.length) {
      setMessengerType(recommendMessenger(nextAnswers))
      actions.updatePersonalization({ messengerTestAnswers: nextAnswers, messengerTestCompleted: true })
      setPhase('result')
    }
  }
  const saveMessenger = () => {
    actions.updatePersonalization({ messengerType, messengerColor, messengerTestAnswers: answers, messengerTestCompleted: true })
    actions.toast('记忆信使已保存')
    setPhase('summary')
  }

  return <div className="page personalization-page">
    <header className="page-heading"><span className="eyebrow">风格实验室</span><h1>属于我的表达方式</h1><p>选择一张承载故事的纸，也认识那个替你送达记忆的信使。</p></header>

    <section className="personalization-section"><div className="section-title"><div><span className="eyebrow">01</span><h2>我的信纸</h2></div><Palette /></div><div className="stationery-layout"><div className="stationery-controls"><PaperPanel><h3>基础颜色</h3><div className="stationery-color-options">{stationeryColors.map(item => <button key={item.id} className={stationeryColor === item.id ? 'selected' : ''} onClick={() => setStationeryColor(item.id)}><i style={{ background: item.value }} />{item.name}{stationeryColor === item.id && <Check size={15} />}</button>)}</div></PaperPanel><PaperPanel><h3>纸张风格与纹理</h3><div className="stationery-texture-options">{stationeryTextures.map(item => <button key={item.id} className={stationeryTexture === item.id ? 'selected' : ''} onClick={() => setStationeryTexture(item.id)}><strong>{item.name}</strong><small>{item.description}</small>{stationeryTexture === item.id && <Check size={15} />}</button>)}</div></PaperPanel><PrimaryButton onClick={saveStationery}>保存我的信纸</PrimaryButton></div><div className="stationery-preview"><span className="eyebrow">实时信件预览</span><LetterPreview stationery={{ color: stationeryColor, texture: stationeryTexture }} letter={{ title: '把那盏灯留在纸上', text: '有些记忆并不急着得到答案。\n我只是想让它沿着这张纸，慢慢抵达你。', layout: 'text', illustration: 0 }} /></div></div></section>

    <section className="personalization-section messenger-personalization"><div className="section-title"><div><span className="eyebrow">02</span><h2>我的记忆信使</h2></div><Sparkles /></div>
      {phase === 'summary' && !saved.messengerTestCompleted && <PaperPanel className="messenger-empty"><MessengerCharacter variant="pebble" size="large" /><div><h3>还没有找到属于你的记忆信使。</h3><p>用五道轻量问题，认识一种更适合你的陪伴方式。它不是心理诊断。</p><PrimaryButton onClick={startTest}>认识我的信使 <ArrowRight size={17} /></PrimaryButton></div></PaperPanel>}
      {phase === 'summary' && saved.messengerTestCompleted && <PaperPanel className="messenger-current"><MessengerCharacter variant={saved.messengerType} size="large" color={currentColor.value} /><div><span className="eyebrow">当前记忆信使</span><h3>{currentMessenger.name}</h3><p>{currentMessenger.description}</p><small>当前颜色：{currentColor.name}</small><div><SecondaryButton onClick={startTest}><RefreshCcw size={16} /> 重新测试</SecondaryButton><PrimaryButton onClick={() => setPhase('choose')}>更换信使或颜色</PrimaryButton></div></div></PaperPanel>}
      {phase === 'test' && <PaperPanel className="messenger-quiz"><span>{answers.length + 1} / {messengerQuestions.length}</span><h2>{question.question}</h2><div>{question.answers.map(answer => <button key={answer} onClick={() => answerQuestion(answer)}>{answer}</button>)}</div><button className="skip-quiz" onClick={() => setPhase('summary')}>先停在这里</button></PaperPanel>}
      {phase === 'result' && <PaperPanel className="messenger-result"><MessengerCharacter variant={recommended} size="large" /><div><span className="eyebrow">为你推荐</span><h3>{messengerOptions.find(item => item.id === recommended)?.name}</h3><p>{messengerOptions.find(item => item.id === recommended)?.description} 推荐只用于帮助选择，不代表任何心理类型。</p><div><SecondaryButton onClick={startTest}>重新测试</SecondaryButton><PrimaryButton onClick={() => { setMessengerType(recommended); setPhase('choose') }}>接受推荐并选择颜色</PrimaryButton></div></div></PaperPanel>}
      {phase === 'choose' && <><div className="messenger-options">{messengerOptions.map(item => <button key={item.id} className={messengerType === item.id ? 'selected' : ''} onClick={() => setMessengerType(item.id)}><MessengerCharacter variant={item.id} size="medium" color={getMessengerColorValue(messengerColor)} /><strong>{item.name}</strong><p>{item.description}</p><span>{messengerType === item.id ? '已选择' : '选择这个信使'}</span></button>)}</div><PaperPanel className="messenger-color-panel"><div><span className="eyebrow">信使颜色</span><h3>为信使选一种颜色</h3></div><div className="messenger-color-options">{messengerColors.map(item => <button key={item.id} aria-label={item.name} title={item.name} className={messengerColor === item.id ? 'selected' : ''} style={{ background: item.value }} onClick={() => setMessengerColor(item.id)}>{messengerColor === item.id && <Check size={16} />}</button>)}</div><MessengerCharacter variant={messengerType} size="large" color={getMessengerColorValue(messengerColor)} /></PaperPanel><div className="sticky-actions"><SecondaryButton onClick={() => setPhase('summary')}>暂不更换</SecondaryButton><PrimaryButton onClick={saveMessenger}>保存我的信使</PrimaryButton></div></>}
    </section>
    {saved.personalizationUpdatedAt && <StatusBanner tone="success">个性化选择会保存在当前浏览器，刷新后仍然保留。</StatusBanner>}
  </div>
}
