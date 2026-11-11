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
import NavDropdown, { type NavDropdownItem } from './NavDropdown';
import UserMenu from './UserMenu';

interface NavItem {
   label: string;
   to: string;
}

const MOVIE_MENU_ITEMS: NavDropdownItem[] = [
   { label: 'Phim đang chiếu', to: '/movies' },
   { label: 'Phim sắp chiếu', to: '/movies?status=COMING_SOON' },
   { label: 'Phim ngừng chiếu', to: '/movies?status=ENDED' },
];

const NAV_ITEMS: NavItem[] = [
   { label: 'Rạp chiếu', to: '/cinemas' },
   { label: 'Thức ăn & nước', to: '/fnb' },
   { label: 'Ưu đãi & khuyến mãi', to: '/promotions' },
   { label: 'Cộng đồng', to: '/community' },
];

function getNavLinkClassName(isActive: boolean): string {
   return cn(
      'group relative whitespace-nowrap px-2.5 py-2 text-sm font-semibold transition-colors',
      isActive ? 'font-bold text-brand-600' : 'text-ink-600 hover:text-brand-600',
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
      <header
         className={cn(
            'sticky top-0 z-40 border-b border-ink-200 bg-white transition-shadow duration-300',
            isScrolled ? 'shadow-lg shadow-ink-900/5' : 'shadow-sm',
         )}
      >
         <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
            <Logo variant="cinema" />

            <nav className="ml-4 hidden items-center lg:flex" aria-label="Điều hướng chính">
               <NavDropdown label="Phim" items={MOVIE_MENU_ITEMS} matchPathPrefix="/movies" />
               {NAV_ITEMS.map((navItem) => (
                  <NavLink key={navItem.to} to={navItem.to} className={({ isActive }) => getNavLinkClassName(isActive)}>
                     {({ isActive }) => (
                        <>
                           {navItem.label}
                           <span
                              className={cn(
                                 'absolute inset-x-2.5 -bottom-[18px] h-0.5 origin-left bg-brand-600 transition-transform duration-300',
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
                  <span className="h-9 w-40 animate-pulse rounded-lg bg-ink-100" aria-hidden="true" />
               ) : user ? (
                  <UserMenu user={user} />
               ) : (
                  <div className="hidden items-center gap-2 sm:flex">
                     <LinkButton to="/login" variant="ghost" size="sm">
                        Đăng nhập
                     </LinkButton>
                     <LinkButton to="/register" size="sm">
                        Đăng ký
                     </LinkButton>
                  </div>
               )}

               <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                  aria-expanded={isMobileMenuOpen}
                  className="grid size-10 place-items-center rounded-lg text-ink-700 transition-colors hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 lg:hidden"
               >
                  {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
               </button>
            </div>
         </div>

         {isMobileMenuOpen && (
            <div className="space-y-4 border-t border-ink-100 bg-white px-4 pb-5 pt-4 lg:hidden">
               <div className="sm:hidden">
                  <CitySelector />
               </div>
               <nav className="flex flex-col gap-1" aria-label="Điều hướng di động">
                  {[...MOVIE_MENU_ITEMS, ...NAV_ITEMS].map((navItem) => (
                     <NavLink
                        key={navItem.to}
                        to={navItem.to}
                        onClick={closeMobileMenu}
                        className="rounded-lg px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
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
