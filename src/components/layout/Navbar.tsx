import { Menu, X } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import LinkButton from '@/components/ui/LinkButton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types/auth';
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
      'relative whitespace-nowrap px-3 py-2 text-[13px] font-extrabold uppercase tracking-wide transition-colors',
      isActive ? 'text-brand-800' : 'text-brand-600 hover:text-brand-800',
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
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
         <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
            <Logo />

            <nav className="ml-4 hidden items-center lg:flex" aria-label="Điều hướng chính">
               <NavDropdown label="Phim" items={MOVIE_MENU_ITEMS} matchPathPrefix="/movies" />
               {NAV_ITEMS.map((navItem) => (
                  <NavLink key={navItem.to} to={navItem.to} className={({ isActive }) => getNavLinkClassName(isActive)}>
                     {({ isActive }) => (
                        <>
                           {navItem.label}
                           {isActive && (
                              <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-brand-600" />
                           )}
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
                  <span className="h-11 w-40 animate-pulse rounded-lg bg-ink-100" aria-hidden="true" />
               ) : user ? (
                  <UserMenu user={user} />
               ) : (
                  <LinkButton
                     to="/login"
                     variant="secondary"
                     className="hidden h-11 border-2 border-brand-300 bg-brand-50 font-extrabold text-brand-800 hover:bg-brand-100 sm:inline-flex"
                  >
                     Đăng nhập/Đăng ký
                  </LinkButton>
               )}

               <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                  aria-expanded={isMobileMenuOpen}
                  className="grid size-11 place-items-center rounded-xl text-ink-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 lg:hidden"
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
                        className="rounded-xl px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-brand-700 transition-colors hover:bg-brand-50"
                     >
                        {navItem.label}
                     </NavLink>
                  ))}
               </nav>
               {!user && !isLoading && (
                  <LinkButton to="/login" fullWidth onClick={closeMobileMenu}>
                     Đăng nhập/Đăng ký
                  </LinkButton>
               )}
            </div>
         )}
      </header>
   );
}

export default Navbar;
