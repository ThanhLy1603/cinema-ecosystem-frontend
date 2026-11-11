import type { ReactElement, ReactNode } from 'react';

interface PageBannerProps {
   title: string;
   description?: string;
   eyebrow?: string;
   children?: ReactNode;
}

export function PageBanner({ title, description, eyebrow, children }: PageBannerProps): ReactElement {
   return (
      <section className="border-b border-ink-200 bg-white">
         <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-12 lg:py-12">
            <div className="space-y-1.5">
               {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>}
               <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
               {description && <p className="max-w-2xl text-sm text-ink-600">{description}</p>}
            </div>
            {children}
         </div>
      </section>
   );
}

export default PageBanner;
