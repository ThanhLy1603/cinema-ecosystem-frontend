import { Popcorn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import Reveal from './Reveal';

interface SectionBannerProps {
   title: string;
   headingId?: string;
   icon?: LucideIcon;
}

export function SectionBanner({ title, headingId, icon: Icon = Popcorn }: SectionBannerProps): ReactElement {
   return (
      <Reveal>
         <div className="relative mb-8 flex h-20 items-center justify-center overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-100 via-brand-50 to-brand-100 sm:h-24">
            <Icon
               className="absolute -left-2 -top-1 size-24 -rotate-12 text-brand-600/35 sm:left-6 sm:size-28"
               strokeWidth={1.25}
               aria-hidden="true"
            />
            <Icon
               className="absolute -bottom-1 -right-2 size-24 rotate-12 text-brand-600/35 sm:right-6 sm:size-28"
               strokeWidth={1.25}
               aria-hidden="true"
            />
            <h2
               id={headingId}
               className="relative text-2xl font-extrabold uppercase tracking-wide text-brand-800 sm:text-3xl"
            >
               {title}
            </h2>
         </div>
      </Reveal>
   );
}

export default SectionBanner;
