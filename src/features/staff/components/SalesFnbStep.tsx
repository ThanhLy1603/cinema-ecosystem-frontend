import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { getPendingFnb, replacePendingFnb } from '@/api/booking/bookingApi';
import { getPublicFnbMenu } from '@/api/fnb/fnbApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import {
   changeSelectionQuantity,
   findSelectionQuantity,
   keepOrderableSelectionLines,
   toBookingFnbRequest,
   toFnbSelectionLines,
} from '@/lib/booking/fnbSelection';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import {
   buildFnbProductRows,
   sumSelectionAmount,
   sumSelectionQuantity,
   type FnbProductRow,
} from '@/lib/staff/fnbProductRows';
import type { BookingFnb } from '@/types/booking/bookingFnb';
import type { FnbSelectionLine } from '@/types/booking/fnbSelection';
import type { FnbMenu } from '@/types/fnb/fnb';
import FnbProductPicker from './FnbProductPicker';

interface SalesFnbStepProps {
   onBack: () => void;
   onContinue: () => void;
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
      staleTime: 0,
      refetchOnMount: 'always',
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
   const productRows: FnbProductRow[] = fnbMenu === undefined ? [] : buildFnbProductRows(fnbMenu);
   const selectedTotal: number = sumSelectionAmount(fnbSelectionLines, productRows);
   const selectedQuantity: number = sumSelectionQuantity(fnbSelectionLines);

   function changeQuantity(productRow: FnbProductRow, delta: number): void {
      const currentQuantity: number = findSelectionQuantity(fnbSelectionLines, productRow.kind, productRow.id);
      setEditedLines(
         changeSelectionQuantity(fnbSelectionLines, productRow.kind, productRow.id, currentQuantity + delta),
      );
   }

   function handleContinue(): void {
      saveMutation.mutate(fnbSelectionLines);
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
            <FnbProductPicker
               fnbProductRows={productRows}
               fnbSelectionLines={fnbSelectionLines}
               isDisabled={saveMutation.isPending}
               onChangeQuantity={changeQuantity}
            />
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
