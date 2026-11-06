import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { Film, User, Ticket, MessageSquareText, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

export function Navbar(): ReactElement {
   const { user, isAuthenticated, logout, hasRole } = useAuthStore()

   return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Film className="w-5 h-5" />
               </div>
               <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Cinema<span className="text-indigo-400">Sphere</span>
               </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
               <Link to="/" className="hover:text-white transition-colors">
                  Phim đang chiếu
               </Link>
               <Link to="/cinemas" className="hover:text-white transition-colors">
                  Cụm Rạp
               </Link>
               <Link to="/promotions" className="hover:text-white transition-colors">
                  Khuyến mãi
               </Link>
               <Link to="/community" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MessageSquareText className="w-4 h-4 text-indigo-400" />
                  Cộng đồng & Blog
               </Link>
               {hasRole('ROLE_ADMIN') && (
                  <Link to="/admin" className="hover:text-indigo-400 transition-colors flex items-center gap-1 text-amber-400">
                     <Shield className="w-4 h-4" />
                     Admin
                  </Link>
               )}
            </nav>

            <div className="flex items-center gap-3">
               {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                     <Link
                        to="/tickets"
                        className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
                     >
                        <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                        Vé của tôi
                     </Link>
                     <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                        <span className="text-sm font-medium text-slate-200 hidden sm:inline">
                           {user.fullName || user.email}
                        </span>
                        <button
                           type="button"
                           onClick={logout}
                           className="text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                        >
                           Đăng xuất
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="flex items-center gap-2">
                     <Link
                        to="/login"
                        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all duration-200"
                     >
                        <User className="w-4 h-4" />
                        Đăng nhập
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </header>
   )
}

export default Navbar
