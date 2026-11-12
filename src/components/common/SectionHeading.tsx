import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';
import Reveal from './Reveal';

interface SectionHeadingProps {
   title: string;
   headingId?: string;
   isCentered?: boolean;
   className?: string;
}

export function SectionHeading({ title, headingId, isCentered = true, className }: SectionHeadingProps): ReactElement {
   return (
      <Reveal className={className}>
         <h2
            id={headingId}
            className={cn(
               'text-2xl font-extrabold uppercase tracking-wide text-ink-900 sm:text-3xl',
               isCentered && 'text-center',
            )}
         >
            {title}
         </h2>
      </Reveal>
   );
}

export default SectionHeading;
