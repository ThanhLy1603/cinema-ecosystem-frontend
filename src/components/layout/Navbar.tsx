import { Menu, X } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import LinkButton from '@/components/ui/LinkButton';
import { cn } from '@/lib/common/utils';
import { useScrolled } from '@/lib/common/useScrolled';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth/auth';
import CitySelector from './CitySelector';
import UserMenu from './UserMenu';

interface NavItem {
   label: string;
   to: string;
}

const NAV_ITEMS: NavItem[] = [
   { label: 'Phim', to: '/movies' },
   { label: 'Thức ăn và nước', to: '/fnb' },
   { label: 'Ưu đãi và khuyến mãi', to: '/promotions' },
   { label: 'Cộng đồng', to: '/community' },
   { label: 'Giới thiệu', to: '/about' },
];

function getNavLinkClassName(isActive: boolean): string {
   return cn(
      'group relative whitespace-nowrap px-3 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors',
      isActive ? 'text-brand-600' : 'text-ink-900 hover:text-brand-600',
   );
}

export function Navbar(): ReactElement {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const isScrolled: boolean = useScrolled();
   const user: User | null = useAuthStore((authState) => authState.user);
   const isLoading: boolean = useAuthStore((authState) => authState.isLoading);

   function closeMobileMenu(): void {
      setIsMobileMenuOpen(false);
   }

   return (
      <header className="sticky top-0 z-40 w-full">
         <div
            className={cn(
               'flex h-16 w-full items-center gap-4 border-b border-white/70 px-4 backdrop-blur-xl transition-all duration-300 sm:px-8 lg:px-12',
               isScrolled ? 'bg-white/90 shadow-md shadow-ink-900/10' : 'bg-white/70',
            )}
         >
            <Logo variant="cinema" />

            <nav className="ml-6 hidden items-center gap-1 lg:flex xl:ml-10 xl:gap-3" aria-label="Điều hướng chính">
               {NAV_ITEMS.map((navItem) => (
                  <NavLink key={navItem.to} to={navItem.to} className={({ isActive }) => getNavLinkClassName(isActive)}>
                     {({ isActive }) => (
                        <>
                           {navItem.label}
                           <span
                              className={cn(
                                 'absolute inset-x-3 -bottom-1 h-0.5 origin-left rounded-full bg-brand-600 transition-transform duration-300',
                                 isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                              )}
                           />
                        </>
                     )}
                  </NavLink>
               ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
               <div className="hidden sm:block">
                  <CitySelector />
               </div>
               {isLoading ? (
                  <span className="h-10 w-40 animate-pulse rounded-xl bg-ink-100" aria-hidden="true" />
               ) : user ? (
                  <UserMenu user={user} />
               ) : (
                  <LinkButton
                     to="/login"
                     size="sm"
                     className="hidden rounded-xl px-5 text-xs font-bold uppercase sm:inline-flex"
                  >
                     Đăng ký / Đăng nhập
                  </LinkButton>
               )}

               <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                  aria-expanded={isMobileMenuOpen}
                  className="grid size-10 place-items-center rounded-xl text-ink-800 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 lg:hidden"
               >
                  {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
               </button>
            </div>
         </div>

         {isMobileMenuOpen && (
            <div className="w-full space-y-4 border-b border-ink-100 bg-white/95 px-4 pb-5 pt-4 shadow-lg backdrop-blur-xl lg:hidden">
               <div className="sm:hidden">
                  <CitySelector />
               </div>
               <nav className="flex flex-col gap-1" aria-label="Điều hướng di động">
                  {NAV_ITEMS.map((navItem) => (
                     <NavLink
                        key={navItem.to}
                        to={navItem.to}
                        onClick={closeMobileMenu}
                        className="rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wide text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
                     >
                        {navItem.label}
                     </NavLink>
                  ))}
               </nav>
               {!user && !isLoading && (
                  <div className="grid grid-cols-2 gap-2">
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
