import type { ReactElement, ReactNode } from 'react';

interface SectionCardProps {
   title: string;
   description?: string;
   children: ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps): ReactElement {
   return (
      <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink-100 sm:p-8">
         <h2 className="text-xl font-bold text-ink-900">{title}</h2>
         {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
         <div className="mt-6">{children}</div>
      </section>
   );
}

export default SectionCard;
