import { UtensilsCrossed } from 'lucide-react';
import type { ReactElement } from 'react';
import { formatVnd } from '@/lib/common/currencyFormat';
import type { FnbCombo } from '@/types/fnb/fnb';

interface FnbComboCardProps {
   fnbCombo: FnbCombo;
}

export function FnbComboCard({ fnbCombo }: FnbComboCardProps): ReactElement {
   const savedAmount: number = fnbCombo.itemsTotalPrice - fnbCombo.price;

   return (
      <article className="flex flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink-200">
         <div className="aspect-[4/3] w-full overflow-hidden bg-ink-100">
            {fnbCombo.imageUrl ? (
               <img src={fnbCombo.imageUrl} alt={fnbCombo.name} loading="lazy" className="size-full object-cover" />
            ) : (
               <div className="grid size-full place-items-center text-ink-300">
                  <UtensilsCrossed className="size-12" aria-hidden="true" />
               </div>
            )}
         </div>
         <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-1">
               <h3 className="text-base font-semibold uppercase text-ink-900">{fnbCombo.name}</h3>
               {fnbCombo.description && <p className="text-[13px] text-ink-500">{fnbCombo.description}</p>}
            </div>
            <ul className="space-y-0.5 text-[13px] text-ink-700">
               {fnbCombo.items.map((fnbComboItem) => (
                  <li key={fnbComboItem.itemId}>
                     {fnbComboItem.quantity} × {fnbComboItem.itemName}
                  </li>
               ))}
            </ul>
            <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-100 pt-3">
               <p className="text-xl font-bold text-brand-700">{formatVnd(fnbCombo.price)}</p>
               {savedAmount > 0 && (
                  <p className="text-right text-xs">
                     <span className="block text-ink-400 line-through">{formatVnd(fnbCombo.itemsTotalPrice)}</span>
                     <span className="font-semibold text-emerald-700">Tiết kiệm {formatVnd(savedAmount)}</span>
                  </p>
               )}
            </div>
         </div>
      </article>
   );
}

export default FnbComboCard;
