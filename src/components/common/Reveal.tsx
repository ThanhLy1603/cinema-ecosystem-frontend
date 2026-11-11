import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/common/utils';
import { useInView } from '@/lib/common/useInView';

interface RevealProps {
   children: ReactNode;
   delayMs?: number;
   className?: string;
}

export function Reveal({ children, delayMs = 0, className }: RevealProps): ReactElement {
   const [revealRef, isInView] = useInView<HTMLDivElement>();

   return (
      <div
         ref={revealRef}
         style={{ transitionDelay: isInView ? `${delayMs}ms` : '0ms' }}
         className={cn(
            'transition-[opacity,translate] duration-700 ease-out',
            isInView ? 'opacity-100 [translate:none]' : 'translate-y-6 opacity-0',
            className,
         )}
      >
         {children}
      </div>
   );
}

export default Reveal;
