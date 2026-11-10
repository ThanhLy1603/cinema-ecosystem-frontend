import type { ReactElement } from 'react';

interface SectionTitleProps {
   title: string;
}

export function SectionTitle({ title }: SectionTitleProps): ReactElement {
   return (
      <div className="flex justify-center">
         <h2 className="rounded-2xl border-2 border-ink-900 bg-white px-8 py-2 text-center text-2xl font-extrabold uppercase tracking-tight text-ink-900 sm:px-12 sm:text-3xl">
            {title}
         </h2>
      </div>
   );
}

export default SectionTitle;
