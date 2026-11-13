import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, Minus, Plus, UtensilsCrossed } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { getPendingFnb, replacePendingFnb } from '@/api/booking/bookingApi';
import { getPublicFnbMenu } from '@/api/fnb/fnbApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
   MAX_FNB_QUANTITY_PER_LINE,
   changeSelectionQuantity,
   findSelectionQuantity,
   keepOrderableSelectionLines,
   toBookingFnbRequest,
   toFnbSelectionLines,
} from '@/lib/booking/fnbSelection';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import type { BookingFnb } from '@/types/booking/bookingFnb';
import type { FnbLineKind, FnbSelectionLine } from '@/types/booking/fnbSelection';
import type { FnbMenu } from '@/types/fnb/fnb';

interface SalesFnbStepProps {
   onBack: () => void;
   onContinue: () => void;
}

interface FnbProductRow {
   kind: FnbLineKind;
   id: number;
   name: string;
   description: string | null;
   imageUrl: string | null;
   price: number;
}

function buildProductRows(fnbMenu: FnbMenu): FnbProductRow[] {
   const comboRows: FnbProductRow[] = fnbMenu.combos
      .filter((fnbCombo) => fnbCombo.orderable)
      .map((fnbCombo): FnbProductRow => ({
         kind: 'COMBO',
         id: fnbCombo.id,
         name: fnbCombo.name,
         description: fnbCombo.items
            .map((fnbComboItem) => `${fnbComboItem.quantity} ${fnbComboItem.itemName}`)
            .join(' + '),
         imageUrl: fnbCombo.imageUrl,
         price: fnbCombo.price,
      }));
   const itemRows: FnbProductRow[] = fnbMenu.items.map((fnbItem): FnbProductRow => ({
      kind: 'ITEM',
      id: fnbItem.id,
      name: fnbItem.name,
      description: null,
      imageUrl: fnbItem.imageUrl,
      price: fnbItem.price,
   }));
   return [...comboRows, ...itemRows];
}

export function SalesFnbStep({ onBack, onContinue }: SalesFnbStepProps): ReactElement {
   const [editedLines, setEditedLines] = useState<FnbSelectionLine[] | null>(null);
   const menuQuery: UseQueryResult<FnbMenu> = useQuery<FnbMenu>({
      queryKey: ['staff', 'ticket-sales', 'fnb-menu'],
      queryFn: getPublicFnbMenu,
   });
   const pendingFnbQuery: UseQueryResult<BookingFnb> = useQuery<BookingFnb>({
      queryKey: ['staff', 'ticket-sales', 'pending-fnb'],
      queryFn: getPendingFnb,
      gcTime: 0,
   });
   const saveMutation: UseMutationResult<BookingFnb, unknown, FnbSelectionLine[]> = useMutation<
      BookingFnb,
      unknown,
      FnbSelectionLine[]
   >({
      mutationFn: (fnbSelectionLines: FnbSelectionLine[]) => replacePendingFnb(toBookingFnbRequest(fnbSelectionLines)),
      onSuccess: onContinue,
   });
   const fnbMenu: FnbMenu | undefined = menuQuery.data;
   const isReady: boolean = fnbMenu !== undefined && pendingFnbQuery.isSuccess;
   const storedLines: FnbSelectionLine[] =
      fnbMenu !== undefined && pendingFnbQuery.data !== undefined
         ? keepOrderableSelectionLines(toFnbSelectionLines(pendingFnbQuery.data), fnbMenu)
         : [];
   const fnbSelectionLines: FnbSelectionLine[] = editedLines ?? storedLines;
   const productRows: FnbProductRow[] = fnbMenu === undefined ? [] : buildProductRows(fnbMenu);
   const selectedTotal: number = fnbSelectionLines.reduce((sumAmount, fnbSelectionLine) => {
      const productRow: FnbProductRow | undefined = productRows.find(
         (candidateRow) =>
            candidateRow.kind === fnbSelectionLine.kind && candidateRow.id === fnbSelectionLine.productId,
      );
      return sumAmount + (productRow?.price ?? 0) * fnbSelectionLine.quantity;
   }, 0);
   const selectedQuantity: number = fnbSelectionLines.reduce(
      (sumQuantity, fnbSelectionLine) => sumQuantity + fnbSelectionLine.quantity,
      0,
   );

   function changeQuantity(productRow: FnbProductRow, delta: number): void {
      const currentQuantity: number = findSelectionQuantity(fnbSelectionLines, productRow.kind, productRow.id);
      setEditedLines(
         changeSelectionQuantity(fnbSelectionLines, productRow.kind, productRow.id, currentQuantity + delta),
      );
   }

   function handleContinue(): void {
      saveMutation.mutate(fnbSelectionLines);
   }

   function renderRow(productRow: FnbProductRow): ReactElement {
      const quantity: number = findSelectionQuantity(fnbSelectionLines, productRow.kind, productRow.id);
      return (
         <li key={`${productRow.kind}-${productRow.id}`} className="flex items-center gap-3 px-4 py-3">
            {productRow.imageUrl ? (
               <img
                  src={productRow.imageUrl}
                  alt={productRow.name}
                  className="size-12 shrink-0 rounded-lg bg-ink-50 object-contain"
               />
            ) : (
               <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-300">
                  <UtensilsCrossed className="size-5" aria-hidden="true" />
               </span>
            )}
            <span className="min-w-0 flex-1">
               <span className="block text-sm font-bold text-ink-900">{productRow.name}</span>
               {productRow.description && (
                  <span className="block text-xs font-semibold text-accent-700">{productRow.description}</span>
               )}
               <span className="block text-xs text-ink-600">{formatVnd(productRow.price)}</span>
            </span>
            <span className="flex items-center gap-2">
               <button
                  type="button"
                  disabled={quantity === 0 || saveMutation.isPending}
                  onClick={() => changeQuantity(productRow, -1)}
                  aria-label={`Giảm số lượng ${productRow.name}`}
                  className="grid size-8 place-items-center rounded-md border border-ink-300 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
               >
                  <Minus className="size-4" aria-hidden="true" />
               </button>
               <span className="w-8 text-center text-base font-extrabold text-ink-900">{quantity}</span>
               <button
                  type="button"
                  disabled={quantity >= MAX_FNB_QUANTITY_PER_LINE || saveMutation.isPending}
                  onClick={() => changeQuantity(productRow, 1)}
                  aria-label={`Tăng số lượng ${productRow.name}`}
                  className="grid size-8 place-items-center rounded-md border border-ink-300 text-ink-700 hover:bg-ink-50 disabled:opacity-40"
               >
                  <Plus className="size-4" aria-hidden="true" />
               </button>
            </span>
         </li>
      );
   }

   return (
      <div className="space-y-5">
         <button
            type="button"
            onClick={onBack}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 disabled:opacity-60"
         >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Quay lại chọn ghế
         </button>
         {(menuQuery.isError || pendingFnbQuery.isError) && (
            <Alert variant="error">{getErrorMessage(menuQuery.error ?? pendingFnbQuery.error)}</Alert>
         )}
         {saveMutation.isError && <Alert variant="error">{getErrorMessage(saveMutation.error)}</Alert>}
         {!isReady && !menuQuery.isError && !pendingFnbQuery.isError && (
            <p className="text-sm text-ink-500">Đang tải thực đơn...</p>
         )}
         {isReady && productRows.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500 shadow-md">
               Hiện chưa có combo hoặc món nào đang bán.
            </p>
         )}
         {isReady && productRows.length > 0 && (
            <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-100">
               {productRows.map(renderRow)}
            </ul>
         )}
         <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-ink-100">
            <p className="flex items-center gap-3 text-sm font-bold text-ink-900">
               Tiền bắp nước
               <span className="rounded-md bg-accent-100 px-2 py-0.5 text-xs font-extrabold text-accent-700">
                  {selectedQuantity} phần
               </span>
               <span className="text-xl font-extrabold text-brand-700">{formatVnd(selectedTotal)}</span>
            </p>
            <Button
               className="h-12 px-6 text-base"
               disabled={!isReady}
               isLoading={saveMutation.isPending}
               onClick={handleContinue}
            >
               {selectedQuantity === 0 ? 'Bỏ qua, sang thanh toán' : 'Tiếp tục thanh toán'}
            </Button>
         </div>
      </div>
   );
}

export default SalesFnbStep;
