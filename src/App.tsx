import type { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from '@/providers/QueryProvider'
import { AppRoutes } from '@/routes/AppRoutes'

export function App(): ReactElement {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App
