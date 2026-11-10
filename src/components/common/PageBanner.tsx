import type { ReactElement, ReactNode } from 'react';

interface PageBannerProps {
   title: string;
   description?: string;
   children?: ReactNode;
}

export function PageBanner({ title, description, children }: PageBannerProps): ReactElement {
   return (
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500">
         <div className="pointer-events-none absolute -right-20 -top-24 -z-10 size-80 rounded-full bg-accent-300/25 blur-3xl" />
         <div className="pointer-events-none absolute -bottom-28 left-10 -z-10 size-72 rounded-full bg-white/10 blur-3xl" />
         <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="space-y-2">
               <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
               {description && <p className="max-w-2xl text-base text-white/85">{description}</p>}
            </div>
            {children}
         </div>
      </section>
   );
}

export default PageBanner;
