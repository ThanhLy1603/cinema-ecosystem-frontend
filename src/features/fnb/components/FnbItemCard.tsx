import { UtensilsCrossed } from 'lucide-react';
import type { ReactElement } from 'react';
import FnbBadge, { type FnbBadgeKind } from '@/components/common/FnbBadge';
import LinkButton from '@/components/ui/LinkButton';
import { formatVnd } from '@/lib/common/currencyFormat';
import { cn } from '@/lib/common/utils';
import type { FnbItem } from '@/types/fnb/fnb';

interface FnbItemCardProps {
   fnbItem: FnbItem;
   isBestSeller?: boolean;
}

export function FnbItemCard({ fnbItem, isBestSeller = false }: FnbItemCardProps): ReactElement {
   const isAvailable: boolean = fnbItem.status === 'AVAILABLE';
   const badgeKind: FnbBadgeKind | null = !isAvailable ? 'SOLD_OUT' : isBestSeller ? 'BEST_SELLER' : null;

   return (
      <article
         className={cn(
            'group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-lg',
            !isAvailable && 'opacity-70',
         )}
      >
         <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-50">
            {fnbItem.imageUrl ? (
               <img
                  src={fnbItem.imageUrl}
                  alt={fnbItem.name}
                  loading="lazy"
                  className="size-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
               />
            ) : (
               <div className="grid size-full place-items-center text-ink-300">
                  <UtensilsCrossed className="size-12" aria-hidden="true" />
               </div>
            )}
            {badgeKind && <FnbBadge kind={badgeKind} className="absolute left-3 top-3" />}
         </div>
         <div className="flex flex-1 flex-col gap-3 p-4">
            <h3 className="text-base font-extrabold uppercase leading-snug text-ink-900">{fnbItem.name}</h3>
            <div className="mt-auto flex items-end justify-between gap-3 pt-2">
               <p className="text-xl font-extrabold text-brand-700">{formatVnd(fnbItem.price)}</p>
               {isAvailable && (
                  <LinkButton
                     to="/movies"
                     size="sm"
                     title="Chọn phim và suất chiếu, bắp nước được thêm ở bước 3 khi đặt vé"
                     className="shrink-0 rounded-full px-4 text-xs font-bold uppercase"
                  >
                     Đặt kèm vé
                  </LinkButton>
               )}
            </div>
         </div>
      </article>
   );
}

export default FnbItemCard;
