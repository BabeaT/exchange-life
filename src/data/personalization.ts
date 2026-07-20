import type { DemoPersonalization, DemoUser } from '../types'

export const stationeryColors: Array<{ id: DemoPersonalization['stationeryColor']; name: string; value: string }> = [
  { id: 'ivory', name: '纸张米白', value: '#fffdf8' },
  { id: 'mist-blue', name: '雾蓝', value: '#e6edef' },
  { id: 'dusty-pink', name: '灰粉', value: '#f0e2e2' },
  { id: 'soft-purple', name: '柔紫', value: '#ebe6ef' },
  { id: 'sage', name: '鼠尾草绿', value: '#e5eadf' },
  { id: 'ochre', name: '暖赭', value: '#eee1ce' },
  { id: 'light-brown', name: '浅褐', value: '#eee7df' },
]

export const stationeryTextures: Array<{ id: DemoPersonalization['stationeryTexture']; name: string; description: string }> = [
  { id: 'clean', name: '素净纸面', description: '安静、清楚，适合长文字。' },
  { id: 'fiber', name: '柔和纤维', description: '带一点细密的纸纤维感。' },
  { id: 'mist', name: '淡雾纹理', description: '像薄雾落在纸面上。' },
  { id: 'vintage', name: '旧信纸', description: '边缘略深，像被仔细收藏过。' },
  { id: 'warm-grain', name: '温暖颗粒', description: '轻微颗粒让纸面更柔和。' },
]

export const messengerOptions: Array<{ id: DemoUser['messenger']; name: string; description: string }> = [
  { id: 'moss', name: '苔团', description: '喜欢从具体的画面慢慢想起。' },
  { id: 'cloud', name: '云团', description: '习惯先听一会儿，再轻轻回应。' },
  { id: 'ember', name: '暖点', description: '常从一句没有说完的话开始。' },
  { id: 'pebble', name: '石子', description: '愿意把零散细节慢慢排好。' },
]

export const messengerColors: Array<{ id: DemoPersonalization['messengerColor']; name: string; value: string }> = [
  { id: 'sage', name: '鼠尾草绿', value: '#adb89f' },
  { id: 'mist-blue', name: '雾蓝', value: '#cad5d6' },
  { id: 'dusty-pink', name: '灰粉', value: '#d9bdbd' },
  { id: 'soft-purple', name: '柔紫', value: '#bdb4c3' },
  { id: 'ochre', name: '暖赭', value: '#c4a277' },
]

export const messengerQuestions = [
  { question: '一段回忆忽然回来时，你通常先注意到什么？', answers: ['一个具体画面', '一句没有说完的话', '当时的声音', '身体里很轻的感觉'] },
  { question: '准备表达一件重要的事时，你更愿意怎样开始？', answers: ['先写下关键词', '从头慢慢讲', '先安静想一会儿', '从一张照片开始'] },
  { question: '对方正在讲述时，你更自然的回应是？', answers: ['认真看见细节', '安静陪伴', '给一点温暖回应', '帮忙理清顺序'] },
  { question: '面对零散的记忆，你希望信使怎样陪你？', answers: ['找回画面', '留出停顿', '守住温度', '整理线索'] },
  { question: '一封信送达时，你希望它带着怎样的感觉？', answers: ['像苔藓一样安静', '像云一样轻柔', '像微光一样温暖', '像石子一样可靠'] },
]

export const getStationeryColorValue = (id: DemoPersonalization['stationeryColor']) => stationeryColors.find(item => item.id === id)?.value || stationeryColors[0].value
export const getMessengerColorValue = (id: DemoPersonalization['messengerColor']) => messengerColors.find(item => item.id === id)?.value || messengerColors[0].value
