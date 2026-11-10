import { Plus, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { formatVnd } from '@/lib/common/currencyFormat';
import { FNB_CATEGORY_LABELS, FNB_STATUS_LABELS } from '@/lib/fnb/fnbLabels';
import type { FnbItem } from '@/types/fnb/fnb';
import type { ComboLineDraft } from '../utils/validation';

interface ComboLinesEditorProps {
   comboLineDrafts: ComboLineDraft[];
   fnbItems: FnbItem[];
   comboPrice: number | null;
   error?: string;
   onChange: (comboLineDrafts: ComboLineDraft[]) => void;
   onAddLine: () => void;
}

function buildItemOptions(fnbItems: FnbItem[]): SelectOption[] {
   return fnbItems.map((fnbItem) => ({
      value: String(fnbItem.id),
      label: `${fnbItem.name} · ${FNB_CATEGORY_LABELS[fnbItem.category]} · ${formatVnd(fnbItem.price)}${
         fnbItem.status === 'UNAVAILABLE' ? ` (${FNB_STATUS_LABELS.UNAVAILABLE.toLowerCase()})` : ''
      }`,
   }));
}

function calculateItemsTotal(comboLineDrafts: ComboLineDraft[], fnbItems: FnbItem[]): number {
   return comboLineDrafts.reduce((runningTotal: number, comboLineDraft) => {
      const fnbItem: FnbItem | undefined = fnbItems.find((candidate) => String(candidate.id) === comboLineDraft.itemId);
      const quantity: number = Number(comboLineDraft.quantity);
      return fnbItem && Number.isInteger(quantity) && quantity > 0
         ? runningTotal + fnbItem.price * quantity
         : runningTotal;
   }, 0);
}

export function ComboLinesEditor({
   comboLineDrafts,
   fnbItems,
   comboPrice,
   error,
   onChange,
   onAddLine,
}: ComboLinesEditorProps): ReactElement {
   const itemOptions: SelectOption[] = buildItemOptions(fnbItems);
   const itemsTotal: number = calculateItemsTotal(comboLineDrafts, fnbItems);
   const priceDifference: number | null = comboPrice === null ? null : itemsTotal - comboPrice;

   function updateLine(lineKey: number, fieldName: 'itemId' | 'quantity', fieldValue: string): void {
      onChange(
         comboLineDrafts.map((comboLineDraft) =>
            comboLineDraft.key === lineKey ? { ...comboLineDraft, [fieldName]: fieldValue } : comboLineDraft,
         ),
      );
   }

   function removeLine(lineKey: number): void {
      onChange(comboLineDrafts.filter((comboLineDraft) => comboLineDraft.key !== lineKey));
   }

   return (
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-ink-700">Món trong combo</h3>
            <Button
               variant="secondary"
               size="sm"
               icon={<Plus className="size-3.5" aria-hidden="true" />}
               onClick={onAddLine}
            >
               Thêm món
            </Button>
         </div>

         {comboLineDrafts.length === 0 && (
            <p className="rounded-lg bg-ink-50 px-4 py-5 text-center text-[13px] text-ink-500">
               Chưa có món nào. Bấm "Thêm món" để chọn thành phần của combo.
            </p>
         )}

         <ul className="space-y-2">
            {comboLineDrafts.map((comboLineDraft) => (
               <li key={comboLineDraft.key} className="grid grid-cols-[1fr_84px_auto] items-end gap-2">
                  <SelectField
                     id={`combo-line-item-${comboLineDraft.key}`}
                     label="Món"
                     hideLabel
                     value={comboLineDraft.itemId}
                     onChange={(itemId) => updateLine(comboLineDraft.key, 'itemId', itemId)}
                     options={itemOptions}
                     placeholder="Chọn món"
                  />
                  <TextField
                     id={`combo-line-quantity-${comboLineDraft.key}`}
                     label="Số lượng"
                     hideLabel
                     value={comboLineDraft.quantity}
                     onChange={(quantity) => updateLine(comboLineDraft.key, 'quantity', quantity)}
                     placeholder="SL"
                  />
                  <button
                     type="button"
                     onClick={() => removeLine(comboLineDraft.key)}
                     aria-label="Xóa dòng này"
                     className="grid size-10 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-danger-50 hover:text-danger-700"
                  >
                     <Trash2 className="size-4" aria-hidden="true" />
                  </button>
               </li>
            ))}
         </ul>

         {error && (
            <p role="alert" className="text-[13px] font-medium text-danger-700">
               {error}
            </p>
         )}

         {itemsTotal > 0 && (
            <dl className="space-y-1 rounded-lg bg-ink-50 px-4 py-3 text-[13px]">
               <div className="flex justify-between">
                  <dt className="text-ink-600">Tổng giá lẻ các món</dt>
                  <dd className="font-semibold text-ink-900">{formatVnd(itemsTotal)}</dd>
               </div>
               {priceDifference !== null && priceDifference > 0 && (
                  <div className="flex justify-between">
                     <dt className="text-ink-600">Khách tiết kiệm</dt>
                     <dd className="font-semibold text-emerald-700">{formatVnd(priceDifference)}</dd>
                  </div>
               )}
               {priceDifference !== null && priceDifference < 0 && (
                  <p className="pt-1 font-medium text-amber-700">
                     Giá combo đang cao hơn mua lẻ {formatVnd(Math.abs(priceDifference))}. Hãy kiểm tra lại giá.
                  </p>
               )}
            </dl>
         )}
      </div>
   );
}

export default ComboLinesEditor;
