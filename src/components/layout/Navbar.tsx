import { Menu, X } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import LinkButton from '@/components/ui/LinkButton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth';
import UserMenu from './UserMenu';

interface NavItem {
   label: string;
   to: string;
}

const NAV_ITEMS: NavItem[] = [
   { label: 'Trang chủ', to: '/' },
   { label: 'Phim', to: '/movies' },
   { label: 'Rạp chiếu', to: '/cinemas' },
   { label: 'Khuyến mãi', to: '/promotions' },
   { label: 'Cộng đồng', to: '/community' },
];

function getNavLinkClassName(isActive: boolean): string {
   return cn(
      'relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
      isActive ? 'text-brand-700' : 'text-ink-600 hover:text-brand-700',
   );
}

export function Navbar(): ReactElement {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const user: User | null = useAuthStore((authState) => authState.user);
   const isLoading: boolean = useAuthStore((authState) => authState.isLoading);

   function closeMobileMenu(): void {
      setIsMobileMenuOpen(false);
   }

   return (
      <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/85 backdrop-blur-xl">
         <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
            <Logo />

            <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
               {NAV_ITEMS.map((navItem) => (
                  <NavLink
                     key={navItem.to}
                     to={navItem.to}
                     end={navItem.to === '/'}
                     className={({ isActive }) => getNavLinkClassName(isActive)}
                  >
                     {({ isActive }) => (
                        <>
                           {navItem.label}
                           {isActive && (
                              <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-gradient-to-r from-brand-500 to-gold-400" />
                           )}
                        </>
                     )}
                  </NavLink>
               ))}
            </nav>

            <div className="flex items-center gap-2">
               {isLoading ? (
                  <span className="h-10 w-36 animate-pulse rounded-full bg-ink-100" aria-hidden="true" />
               ) : user ? (
                  <UserMenu user={user} />
               ) : (
                  <div className="hidden items-center gap-2 sm:flex">
                     <LinkButton to="/login" variant="ghost">
                        Đăng nhập
                     </LinkButton>
                     <LinkButton to="/register">Đăng ký</LinkButton>
                  </div>
               )}

               <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                  aria-expanded={isMobileMenuOpen}
                  className="grid size-11 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 md:hidden"
               >
                  {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
               </button>
            </div>
         </div>

         {isMobileMenuOpen && (
            <div className="border-t border-ink-100 bg-white px-4 pb-5 pt-3 md:hidden">
               <nav className="flex flex-col gap-1" aria-label="Điều hướng di động">
                  {NAV_ITEMS.map((navItem) => (
                     <NavLink
                        key={navItem.to}
                        to={navItem.to}
                        end={navItem.to === '/'}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                           cn(
                              'rounded-xl px-4 py-3 text-base font-semibold transition-colors',
                              isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50',
                           )
                        }
                     >
                        {navItem.label}
                     </NavLink>
                  ))}
               </nav>
               {!user && !isLoading && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                     <LinkButton to="/login" variant="secondary" onClick={closeMobileMenu}>
                        Đăng nhập
                     </LinkButton>
                     <LinkButton to="/register" onClick={closeMobileMenu}>
                        Đăng ký
                     </LinkButton>
                  </div>
               )}
            </div>
         )}
      </header>
   );
}

export default Navbar;
