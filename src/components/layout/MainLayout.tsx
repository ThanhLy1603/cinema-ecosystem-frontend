import type { ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export function MainLayout(): ReactElement {
   return (
      <div className="flex min-h-screen flex-col bg-cream">
         <Navbar />
         <main className="flex-1">
            <Outlet />
         </main>
         <Footer />
      </div>
   )
}

export default MainLayout
