import { UtensilsCrossed } from 'lucide-react';
import type { ReactElement } from 'react';
import { formatVnd } from '@/lib/common/currencyFormat';
import type { FnbItem } from '@/types/fnb/fnb';

interface FnbItemCardProps {
   fnbItem: FnbItem;
}

export function FnbItemCard({ fnbItem }: FnbItemCardProps): ReactElement {
   return (
      <article className="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-ink-200">
         {fnbItem.imageUrl ? (
            <img
               src={fnbItem.imageUrl}
               alt={fnbItem.name}
               loading="lazy"
               className="size-16 shrink-0 rounded-md object-cover"
            />
         ) : (
            <span className="grid size-16 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-300">
               <UtensilsCrossed className="size-6" aria-hidden="true" />
            </span>
         )}
         <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink-900">{fnbItem.name}</h3>
            <p className="mt-0.5 text-sm font-bold text-brand-700">{formatVnd(fnbItem.price)}</p>
         </div>
      </article>
   );
}

export default FnbItemCard;
