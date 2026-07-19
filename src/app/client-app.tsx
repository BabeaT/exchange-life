'use client'

import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { DemoProvider } from '@/store/DemoContext'

export function ClientApp() {
  return (
    <StrictMode>
      <BrowserRouter>
        <DemoProvider>
          <App />
        </DemoProvider>
      </BrowserRouter>
    </StrictMode>
  )
}
