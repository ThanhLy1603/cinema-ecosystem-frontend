import { Film, Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/common/utils';

type LogoTone = 'default' | 'light';
type LogoVariant = 'flat' | 'cinema';

interface LogoProps {
   tone?: LogoTone;
   variant?: LogoVariant;
   to?: string;
   className?: string;
}

export function Logo({ tone = 'default', variant = 'flat', to = '/', className }: LogoProps): ReactElement {
   const isLight: boolean = tone === 'light';

   if (variant === 'cinema') {
      return (
         <Link
            to={to}
            aria-label="CinemaSphere - Trang chủ"
            className={cn('group inline-flex shrink-0 items-center gap-3', className)}
         >
            <span className="grid size-10 place-items-center rounded-xl text-white shadow-glow transition-transform [background:var(--cta-bg)] group-hover:scale-105">
               <Film className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
               <span
                  className={cn(
                     'text-xl font-extrabold uppercase tracking-wider',
                     isLight ? 'text-white' : 'text-ink-900',
                  )}
               >
                  Cinema <span className={isLight ? 'text-brand-400' : 'text-brand-600'}>Sphere</span>
               </span>
               <span
                  className={cn(
                     'hidden text-[10px] font-semibold uppercase tracking-widest sm:block',
                     isLight ? 'text-white/50' : 'text-ink-500',
                  )}
               >
                  Đặt vé xem phim trực tuyến
               </span>
            </span>
         </Link>
      );
   }

   return (
      <Link
         to={to}
         aria-label="CinemaSphere - Trang chủ"
         className={cn('group inline-flex items-center gap-2.5', className)}
      >
         <span
            className={cn(
               'relative grid size-9 place-items-center rounded-lg text-white',
               isLight ? 'bg-white/20 ring-1 ring-white/40 backdrop-blur' : 'bg-brand-600',
            )}
         >
            <Ticket className="size-[18px]" aria-hidden="true" />
         </span>
         <span className={cn('text-lg font-bold tracking-tight', isLight ? 'text-white' : 'text-ink-900')}>
            Cinema<span className={isLight ? 'text-accent-300' : 'text-brand-600'}>Sphere</span>
         </span>
      </Link>
   );
}

export default Logo;
