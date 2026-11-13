import { Minus, Plus, UtensilsCrossed } from 'lucide-react';
import type { ReactElement } from 'react';
import { MAX_FNB_QUANTITY_PER_LINE, findSelectionQuantity } from '@/lib/booking/fnbSelection';
import { formatVnd } from '@/lib/common/currencyFormat';
import type { FnbProductRow } from '@/lib/staff/fnbProductRows';
import type { FnbSelectionLine } from '@/types/booking/fnbSelection';

interface FnbProductPickerProps {
   fnbProductRows: FnbProductRow[];
   fnbSelectionLines: FnbSelectionLine[];
   isDisabled: boolean;
   onChangeQuantity: (fnbProductRow: FnbProductRow, delta: number) => void;
}

export function FnbProductPicker({
   fnbProductRows,
   fnbSelectionLines,
   isDisabled,
   onChangeQuantity,
}: FnbProductPickerProps): ReactElement {
   function renderRow(fnbProductRow: FnbProductRow): ReactElement {
      const quantity: number = findSelectionQuantity(fnbSelectionLines, fnbProductRow.kind, fnbProductRow.id);
      return (
         <li key={`${fnbProductRow.kind}-${fnbProductRow.id}`} className="flex items-center gap-3 px-4 py-3">
            {fnbProductRow.imageUrl ? (
               <img
                  src={fnbProductRow.imageUrl}
                  alt={fnbProductRow.name}
                  className="size-12 shrink-0 rounded-lg bg-ink-50 object-contain"
               />
            ) : (
               <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-300">
                  <UtensilsCrossed className="size-5" aria-hidden="true" />
               </span>
            )}
            <span className="min-w-0 flex-1">
               <span className="block text-sm font-bold text-ink-900">{fnbProductRow.name}</span>
               {fnbProductRow.description && (
                  <span className="block text-xs font-semibold text-accent-700">{fnbProductRow.description}</span>
               )}
               <span className="block text-xs text-ink-600">{formatVnd(fnbProductRow.price)}</span>
            </span>
            <span className="flex items-center gap-2">
               <button
                  type="button"
                  disabled={quantity === 0 || isDisabled}
                  onClick={() => onChangeQuantity(fnbProductRow, -1)}
                  aria-label={`Giảm số lượng ${fnbProductRow.name}`}
                  className="grid size-8 place-items-center rounded-md border border-ink-300 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
               >
                  <Minus className="size-4" aria-hidden="true" />
               </button>
               <span className="w-8 text-center text-base font-extrabold text-ink-900">{quantity}</span>
               <button
                  type="button"
                  disabled={quantity >= MAX_FNB_QUANTITY_PER_LINE || isDisabled}
                  onClick={() => onChangeQuantity(fnbProductRow, 1)}
                  aria-label={`Tăng số lượng ${fnbProductRow.name}`}
                  className="grid size-8 place-items-center rounded-md border border-ink-300 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
               >
                  <Plus className="size-4" aria-hidden="true" />
               </button>
            </span>
         </li>
      );
   }

   return (
      <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100">
         {fnbProductRows.map(renderRow)}
      </ul>
   );
}

export default FnbProductPicker;
