import type { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { FloatingChatbotWidget } from '@/features/ai-chat/FloatingChatbotWidget'

export function MainLayout(): ReactElement {
   return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
         <Navbar />
         <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
         </main>
         <Footer />
         <FloatingChatbotWidget />
      </div>
   )
}

export default MainLayout
