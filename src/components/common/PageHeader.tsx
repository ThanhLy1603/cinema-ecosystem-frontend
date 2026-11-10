import type { ReactElement, ReactNode } from 'react';

interface PageHeaderProps {
   title: string;
   description?: string;
   actions?: ReactNode;
   badge?: ReactNode;
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps): ReactElement {
   return (
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
         <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
               <h1 className="text-xl font-semibold tracking-tight text-ink-900">{title}</h1>
               {badge}
            </div>
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
         </div>
         {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
   );
}

export default PageHeader;
