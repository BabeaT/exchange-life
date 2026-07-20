import type { Metadata } from 'next'
import '../styles/index.css'
import '../styles/personalization.css'
import '../styles/mode-a-demo.css'

export const metadata: Metadata = {
  title: '交换人生',
  description: '为亲密关系里的共同经历生成可确认、可送达、可保存的记忆绘本。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
