import { UtensilsCrossed } from 'lucide-react';
import type { ReactElement } from 'react';
import LinkButton from '@/components/ui/LinkButton';
import { formatVnd } from '@/lib/common/currencyFormat';
import { cn } from '@/lib/common/utils';
import type { FnbCombo } from '@/types/fnb/fnb';
import FnbBadge, { type FnbBadgeKind } from './FnbBadge';

interface FnbComboCardProps {
   fnbCombo: FnbCombo;
   isBestSeller?: boolean;
}

function resolveBadgeKind(fnbCombo: FnbCombo, isBestSeller: boolean, savedAmount: number): FnbBadgeKind | null {
   if (!fnbCombo.orderable) {
      return 'SOLD_OUT';
   }
   if (isBestSeller) {
      return 'BEST_SELLER';
   }
   return savedAmount > 0 ? 'PROMO' : null;
}

export function FnbComboCard({ fnbCombo, isBestSeller = false }: FnbComboCardProps): ReactElement {
   const savedAmount: number = fnbCombo.itemsTotalPrice - fnbCombo.price;
   const badgeKind: FnbBadgeKind | null = resolveBadgeKind(fnbCombo, isBestSeller, savedAmount);

   return (
      <article
         className={cn(
            'group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-lg',
            !fnbCombo.orderable && 'opacity-70',
         )}
      >
         <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
            {fnbCombo.imageUrl ? (
               <img
                  src={fnbCombo.imageUrl}
                  alt={fnbCombo.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            ) : (
               <div className="grid size-full place-items-center text-ink-300">
                  <UtensilsCrossed className="size-12" aria-hidden="true" />
               </div>
            )}
            {badgeKind && <FnbBadge kind={badgeKind} className="absolute left-3 top-3" />}
         </div>
         <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-1">
               <h3 className="text-base font-extrabold uppercase text-ink-900">{fnbCombo.name}</h3>
               {fnbCombo.description && <p className="text-sm text-ink-700">{fnbCombo.description}</p>}
            </div>
            <ul className="space-y-0.5 text-sm text-ink-700">
               {fnbCombo.items.map((fnbComboItem) => (
                  <li key={fnbComboItem.itemId}>
                     {fnbComboItem.quantity} × {fnbComboItem.itemName}
                  </li>
               ))}
            </ul>
            <div className="mt-auto flex items-end justify-between gap-3 pt-2">
               <div className="space-y-1">
                  <p className="flex items-baseline gap-2">
                     <span className="text-xl font-extrabold text-brand-700">{formatVnd(fnbCombo.price)}</span>
                     {savedAmount > 0 && (
                        <span className="text-xs text-ink-400 line-through">{formatVnd(fnbCombo.itemsTotalPrice)}</span>
                     )}
                  </p>
                  {savedAmount > 0 && (
                     <p
                        className={cn(
                           'inline-block rounded px-2 py-0.5 text-xs font-bold',
                           isBestSeller ? 'bg-accent-100 text-accent-700' : 'bg-brand-100 text-brand-700',
                        )}
                     >
                        Tiết kiệm {formatVnd(savedAmount)}
                     </p>
                  )}
               </div>
               {fnbCombo.orderable && (
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

export default FnbComboCard;
