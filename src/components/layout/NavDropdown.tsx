import { ChevronDown } from 'lucide-react';
import { useCallback, useRef, useState, type ReactElement } from 'react';
import { Link, useLocation, type Location } from 'react-router-dom';
import { useOutsideClick } from '@/lib/common/useOutsideClick';
import { cn } from '@/lib/common/utils';

export interface NavDropdownItem {
   label: string;
   to: string;
}

interface NavDropdownProps {
   label: string;
   items: NavDropdownItem[];
   matchPathPrefix: string;
}

export function NavDropdown({ label, items, matchPathPrefix }: NavDropdownProps): ReactElement {
   const [isOpen, setIsOpen] = useState<boolean>(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const location: Location = useLocation();
   const isActive: boolean = location.pathname.startsWith(matchPathPrefix);

   const closeMenu: () => void = useCallback((): void => setIsOpen(false), []);
   useOutsideClick(containerRef, closeMenu);

   return (
      <div ref={containerRef} className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={closeMenu}>
         <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
               'group relative flex items-center gap-1 px-2.5 py-2 text-sm font-semibold transition-colors',
               isActive ? 'font-bold text-brand-600' : 'text-ink-600 hover:text-brand-600',
            )}
         >
            {label}
            <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
            <span
               className={cn(
                  'absolute inset-x-2.5 -bottom-[18px] h-0.5 origin-left bg-brand-600 transition-transform duration-300',
                  isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
               )}
            />
         </button>
         {isOpen && (
            <div role="menu" className="absolute left-0 top-full z-50 w-56 animate-dropdown pt-2">
               <div className="overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-soft">
                  {items.map((item) => (
                     <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={closeMenu}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                     >
                        {item.label}
                     </Link>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}

export default NavDropdown;
