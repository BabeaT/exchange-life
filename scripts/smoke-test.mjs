import { access, readFile } from 'node:fs/promises'

const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const state = await readFile(new URL('../src/store/DemoContext.tsx', import.meta.url), 'utf8')
const docs = await readFile(new URL('../docs/design/implemented-page-map.md', import.meta.url), 'utf8')
const entry = await readFile(new URL('../src/legacy-pages/EntryPages.tsx', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/styles/index.css', import.meta.url), 'utf8')
const story = await readFile(new URL('../src/data/modeAStory.ts', import.meta.url), 'utf8')

const requiredRoutes = [
  '/', '/start', '/auth', '/profile', '/home', '/exchanges/new', '/join',
  '/write', '/organize', '/compose', '/preview', '/send', '/waiting',
  '/delivery/', '/letters/', '/respond', '/reply-choice/', '/convergence',
  '/memory', '/memory-tree', '/space', '/settings', '/demo-control', '/style-lab',
]

const missingRoutes = requiredRoutes.filter(route => !app.includes(route))
if (missingRoutes.length) throw new Error(`Missing routes: ${missingRoutes.join(', ')}`)

for (const required of ['localStorage', 'user-a', 'user-b', 'intersectionStatus', 'wateredBy']) {
  if (!state.includes(required)) throw new Error(`Missing persisted demo capability: ${required}`)
}

for (const required of ['共同事件', '人生片段', 'Demo 控制台', '记忆树']) {
  if (!docs.includes(required)) throw new Error(`Missing implemented page-map entry: ${required}`)
}

const brandCopy = '我的话语，一半毫无意义；'
const brandCopySecondLine = '但我说出来，'
const removedCopies = ['有些事情', '一封信的距离']
if (!entry.includes('<h1>交换人生</h1>') || !entry.includes(brandCopy) || !entry.includes(brandCopySecondLine)) {
  throw new Error('Brand title or required statement is missing')
}
if (removedCopies.some(copy => entry.includes(copy))) throw new Error('Removed brand copy is still present')
for (const rule of ['white-space:nowrap', 'word-break:keep-all', 'font-size:clamp(2.4rem,8.5vw,8.8rem)']) {
  if (!styles.includes(rule)) throw new Error(`Missing responsive brand-title rule: ${rule}`)
}

for (let index = 1; index <= 14; index += 1) {
  const imagePath = new URL(`../public/demo/story-1/image${index}.png`, import.meta.url)
  await access(imagePath)
  if (!story.includes(`/demo/story-1/image${index}.png`)) throw new Error(`Story image ${index} is not mapped to demo content`)
}

for (const staleTerm of ['火车站', '列车', '站台']) {
  if (story.includes(staleTerm)) throw new Error(`Stale station narrative remains in story data: ${staleTerm}`)
}

console.log(`Smoke checks passed: ${requiredRoutes.length} route patterns, dual-user persistence, 14 mapped story images, brand entry, implemented page map.`)
