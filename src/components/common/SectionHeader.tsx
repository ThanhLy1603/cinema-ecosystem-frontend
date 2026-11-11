import type { LucideIcon } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/common/utils';
import Reveal from './Reveal';

interface SectionHeaderProps {
   eyebrow: string;
   eyebrowIcon?: LucideIcon;
   title: string;
   description?: string;
   headingId?: string;
   action?: ReactNode;
   isCentered?: boolean;
}

export function SectionHeader({
   eyebrow,
   eyebrowIcon: EyebrowIcon,
   title,
   description,
   headingId,
   action,
   isCentered = false,
}: SectionHeaderProps): ReactElement {
   return (
      <Reveal>
         <div
            className={cn(
               'mb-8 gap-6 pb-6',
               isCentered
                  ? 'mx-auto max-w-2xl text-center'
                  : 'flex flex-col border-b border-ink-200 md:flex-row md:items-end md:justify-between',
            )}
         >
            <div>
               <p
                  className={cn(
                     'flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600',
                     isCentered && 'justify-center',
                  )}
               >
                  {EyebrowIcon && <EyebrowIcon className="size-3.5" aria-hidden="true" />}
                  {eyebrow}
               </p>
               <h2 id={headingId} className="mt-1.5 text-3xl font-extrabold text-ink-900 sm:text-4xl">
                  {title}
               </h2>
               {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
            </div>
            {action}
         </div>
      </Reveal>
   );
}

export default SectionHeader;
