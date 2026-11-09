import { ArrowLeft, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import LinkButton from '@/components/ui/LinkButton';

interface ComingSoonPageProps {
   title: string;
   description: string;
   icon: LucideIcon;
}

export function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps): ReactElement {
   return (
      <section className="mx-auto grid min-h-[60vh] max-w-2xl place-items-center px-4 py-20 text-center">
         <div className="space-y-6">
            <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-50 to-gold-100 text-brand-600 shadow-card ring-1 ring-brand-100">
               <Icon className="size-10" aria-hidden="true" />
            </span>
            <div className="space-y-2">
               <span className="inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-600">
                  Sắp ra mắt
               </span>
               <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{title}</h1>
               <p className="mx-auto max-w-md text-ink-500">{description}</p>
            </div>
            <LinkButton to="/" variant="secondary" icon={<ArrowLeft className="size-4" />}>
               Về trang chủ
            </LinkButton>
         </div>
      </section>
   );
}

export default ComingSoonPage;
