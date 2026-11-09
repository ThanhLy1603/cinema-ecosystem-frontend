import { ArrowLeft } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import AuthShowcase from './AuthShowcase';

export function AuthLayout(): ReactElement {
   return (
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
         <AuthShowcase />

         <main className="relative flex flex-col bg-gradient-to-b from-cream to-sand/70">
            <div className="flex items-center justify-between px-6 py-5 sm:px-10">
               <div className="lg:hidden">
                  <Logo />
               </div>
               <Link
                  to="/"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
               >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Về trang chủ
               </Link>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 pb-10 sm:px-10">
               <div className="w-full max-w-[460px] animate-fade-up">
                  <Outlet />
               </div>
            </div>

            <p className="px-6 pb-6 text-center text-xs text-ink-400">© 2026 CinemaSphere</p>
         </main>
      </div>
   );
}

export default AuthLayout;
