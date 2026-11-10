import { Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/common/utils';

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
