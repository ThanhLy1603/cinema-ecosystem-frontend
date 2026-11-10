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
               'relative flex items-center gap-1 px-3 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors',
               isActive ? 'text-brand-700' : 'text-ink-700 hover:text-brand-700',
            )}
         >
            {label}
            <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
            {isActive && <span className="absolute inset-x-3 -bottom-[15px] h-0.5 bg-brand-600" />}
         </button>
         {isOpen && (
            <div role="menu" className="absolute left-0 top-full z-50 w-56 pt-2">
               <div className="overflow-hidden rounded-lg border border-ink-200 bg-white p-1 shadow-soft">
                  {items.map((item) => (
                     <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        onClick={closeMenu}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-brand-700"
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
