import { Minus, Plus, UtensilsCrossed } from 'lucide-react';
import type { ReactElement } from 'react';
import { formatVnd } from '@/lib/common/currencyFormat';

interface FnbProductCardProps {
   name: string;
   description: string | null;
   detailLines: string[];
   imageUrl: string | null;
   price: number;
   originalPrice: number | null;
   quantity: number;
   maxQuantity: number;
   isDisabled: boolean;
   onQuantityChange: (quantity: number) => void;
}

export function FnbProductCard({
   name,
   description,
   detailLines,
   imageUrl,
   price,
   originalPrice,
   quantity,
   maxQuantity,
   isDisabled,
   onQuantityChange,
}: FnbProductCardProps): ReactElement {
   const savedAmount: number = originalPrice !== null ? originalPrice - price : 0;

   function handleDecrease(): void {
      onQuantityChange(quantity - 1);
   }

   function handleIncrease(): void {
      onQuantityChange(quantity + 1);
   }

   return (
      <article
         className={
            quantity > 0
               ? 'flex flex-col overflow-hidden rounded-lg bg-white ring-2 ring-brand-500'
               : 'flex flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink-200'
         }
      >
         <div className="aspect-[4/3] w-full overflow-hidden bg-ink-100">
            {imageUrl ? (
               <img src={imageUrl} alt={name} loading="lazy" className="size-full object-cover" />
            ) : (
               <div className="grid size-full place-items-center text-ink-300">
                  <UtensilsCrossed className="size-12" aria-hidden="true" />
               </div>
            )}
         </div>
         <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="space-y-1">
               <h3 className="text-base font-semibold uppercase text-ink-900">{name}</h3>
               {description && <p className="text-[13px] text-ink-500">{description}</p>}
            </div>
            {detailLines.length > 0 && (
               <ul className="space-y-0.5 text-[13px] text-ink-700">
                  {detailLines.map((detailLine) => (
                     <li key={detailLine}>{detailLine}</li>
                  ))}
               </ul>
            )}
            <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-100 pt-3">
               <div>
                  <p className="text-xl font-bold text-brand-700">{formatVnd(price)}</p>
                  {savedAmount > 0 && (
                     <p className="text-xs font-semibold text-emerald-700">Tiết kiệm {formatVnd(savedAmount)}</p>
                  )}
               </div>
               <div
                  role="group"
                  aria-label={`Số lượng ${name}`}
                  className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-1"
               >
                  <button
                     type="button"
                     aria-label={`Giảm số lượng ${name}`}
                     disabled={isDisabled || quantity === 0}
                     onClick={handleDecrease}
                     className="grid size-8 place-items-center rounded-md text-ink-700 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                     <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span aria-live="polite" className="w-7 text-center text-sm font-bold text-ink-900">
                     {quantity}
                  </span>
                  <button
                     type="button"
                     aria-label={`Tăng số lượng ${name}`}
                     disabled={isDisabled || quantity >= maxQuantity}
                     onClick={handleIncrease}
                     className="grid size-8 place-items-center rounded-md text-brand-700 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                     <Plus className="size-4" aria-hidden="true" />
                  </button>
               </div>
            </div>
         </div>
      </article>
   );
}

export default FnbProductCard;
