import { Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type LogoTone = 'default' | 'light';

interface LogoProps {
   tone?: LogoTone;
   to?: string;
   className?: string;
}

export function Logo({ tone = 'default', to = '/', className }: LogoProps): ReactElement {
   const isLight: boolean = tone === 'light';
   return (
      <Link
         to={to}
         aria-label="CinemaSphere - Trang chủ"
         className={cn('group inline-flex items-center gap-2.5', className)}
      >
         <span
            className={cn(
               'relative grid size-10 place-items-center rounded-xl text-white transition-transform duration-200 group-hover:-rotate-6',
               isLight
                  ? 'bg-white/20 ring-1 ring-white/40 backdrop-blur'
                  : 'bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow',
            )}
         >
            <Ticket className="size-5" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 size-3 rounded-full bg-accent-400 ring-2 ring-white" />
         </span>
         <span className={cn('text-xl font-extrabold tracking-tight', isLight ? 'text-white' : 'text-ink-900')}>
            Cinema<span className={isLight ? 'text-accent-300' : 'text-brand-600'}>Sphere</span>
         </span>
      </Link>
   );
}

export default Logo;
