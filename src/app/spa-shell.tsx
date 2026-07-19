'use client'

import dynamic from 'next/dynamic'

const LegacyDemoApp = dynamic(() => import('@/app/client-app').then(module => module.ClientApp), {
  ssr: false,
})

export function SpaShell() {
  return <LegacyDemoApp />
}
