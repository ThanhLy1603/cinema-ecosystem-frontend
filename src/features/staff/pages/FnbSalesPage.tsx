import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { checkoutFnbSale } from '@/api/staff/fnbSalesApi';
import { getPublicFnbMenu } from '@/api/fnb/fnbApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { changeSelectionQuantity, findSelectionQuantity, toBookingFnbRequest } from '@/lib/booking/fnbSelection';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { evaluateCounterPayment, type CounterPaymentEvaluation } from '@/lib/staff/counterPayment';
import {
   buildFnbProductRows,
   sumSelectionAmount,
   sumSelectionQuantity,
   type FnbProductRow,
} from '@/lib/staff/fnbProductRows';
import { useStaffBranch, type StaffBranchSelection } from '@/lib/staff/useStaffBranch';
import type { FnbSelectionLine } from '@/types/booking/fnbSelection';
import type { FnbMenu } from '@/types/fnb/fnb';
import type { CounterFnbCheckoutRequest, CounterFnbReceipt } from '@/types/staff/fnbSales';
import type { CounterPaymentMethod } from '@/types/staff/ticketSales';
import CounterPaymentPanel from '../components/CounterPaymentPanel';
import FnbProductPicker from '../components/FnbProductPicker';
import FnbSalesReceipt from '../components/FnbSalesReceipt';

export function FnbSalesPage(): ReactElement {
   const staffBranchSelection: StaffBranchSelection = useStaffBranch();
   const cinemaId: number | null = staffBranchSelection.currentBranch?.cinemaId ?? null;
   const [fnbSelectionLines, setFnbSelectionLines] = useState<FnbSelectionLine[]>([]);
   const [paymentMethod, setPaymentMethod] = useState<CounterPaymentMethod>('CASH');
   const [cashInput, setCashInput] = useState<string>('');
   const [counterFnbReceipt, setCounterFnbReceipt] = useState<CounterFnbReceipt | null>(null);
   const menuQuery: UseQueryResult<FnbMenu> = useQuery<FnbMenu>({
      queryKey: ['staff', 'fnb-sales', 'fnb-menu'],
      queryFn: getPublicFnbMenu,
      gcTime: 0,
   });
   const checkoutMutation: UseMutationResult<CounterFnbReceipt, unknown, CounterFnbCheckoutRequest> = useMutation<
      CounterFnbReceipt,
      unknown,
      CounterFnbCheckoutRequest
   >({
      mutationFn: checkoutFnbSale,
      onSuccess: setCounterFnbReceipt,
   });
   const fnbMenu: FnbMenu | undefined = menuQuery.data;
   const productRows: FnbProductRow[] = fnbMenu === undefined ? [] : buildFnbProductRows(fnbMenu);
   const selectedTotal: number = sumSelectionAmount(fnbSelectionLines, productRows);
   const selectedQuantity: number = sumSelectionQuantity(fnbSelectionLines);
   const { cashReceived, isValid: isPaymentValid }: CounterPaymentEvaluation = evaluateCounterPayment(
      paymentMethod,
      cashInput,
      selectedTotal,
   );
   const canCheckout: boolean = cinemaId !== null && selectedTotal > 0 && isPaymentValid;

   function changeQuantity(fnbProductRow: FnbProductRow, delta: number): void {
      const currentQuantity: number = findSelectionQuantity(fnbSelectionLines, fnbProductRow.kind, fnbProductRow.id);
      setFnbSelectionLines(
         changeSelectionQuantity(fnbSelectionLines, fnbProductRow.kind, fnbProductRow.id, currentQuantity + delta),
      );
   }

   function handleCheckout(): void {
      if (cinemaId === null) {
         return;
      }
      checkoutMutation.mutate({
         cinemaId,
         paymentMethod,
         cashReceived: paymentMethod === 'CASH' && cashReceived !== null ? cashReceived : undefined,
         lines: toBookingFnbRequest(fnbSelectionLines).lines,
      });
   }

   function handleNewSale(): void {
      setCounterFnbReceipt(null);
      setFnbSelectionLines([]);
      setCashInput('');
      setPaymentMethod('CASH');
      checkoutMutation.reset();
   }

   function renderSelectedLine(fnbSelectionLine: FnbSelectionLine): ReactElement | null {
      const fnbProductRow: FnbProductRow | undefined = productRows.find(
         (candidateRow) =>
            candidateRow.kind === fnbSelectionLine.kind && candidateRow.id === fnbSelectionLine.productId,
      );
      if (fnbProductRow === undefined) {
         return null;
      }
      return (
         <li
            key={`${fnbSelectionLine.kind}-${fnbSelectionLine.productId}`}
            className="flex justify-between gap-3 py-1.5 text-sm"
         >
            <span>
               {fnbSelectionLine.quantity} × {fnbProductRow.name}
            </span>
            <span>{formatVnd(fnbProductRow.price * fnbSelectionLine.quantity)}</span>
         </li>
      );
   }

   function renderBody(): ReactElement {
      if (counterFnbReceipt !== null) {
         return <FnbSalesReceipt counterFnbReceipt={counterFnbReceipt} onNewSale={handleNewSale} />;
      }
      return (
         <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-5">
               {menuQuery.isError && <Alert variant="error">{getErrorMessage(menuQuery.error)}</Alert>}
               {menuQuery.isPending && <p className="text-sm text-ink-500">Đang tải thực đơn...</p>}
               {menuQuery.isSuccess && productRows.length === 0 && (
                  <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-500 shadow-md">
                     Hiện chưa có combo hoặc món nào đang bán.
                  </p>
               )}
               {productRows.length > 0 && (
                  <FnbProductPicker
                     fnbProductRows={productRows}
                     fnbSelectionLines={fnbSelectionLines}
                     isDisabled={checkoutMutation.isPending}
                     onChangeQuantity={changeQuantity}
                  />
               )}
            </div>

            <div className="space-y-5">
               <section className="space-y-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
                  <h2 className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-wide text-ink-700">
                     Đơn hiện tại
                     <span className="rounded-md bg-accent-100 px-2 py-0.5 text-xs font-extrabold text-accent-700">
                        {selectedQuantity} phần
                     </span>
                  </h2>
                  {fnbSelectionLines.length === 0 ? (
                     <p className="text-sm text-ink-500">Chưa chọn combo hoặc món nào.</p>
                  ) : (
                     <ul className="divide-y divide-ink-100">{fnbSelectionLines.map(renderSelectedLine)}</ul>
                  )}
                  <p className="flex items-center justify-between border-t border-ink-200 pt-3 text-sm font-bold text-ink-900">
                     <span>Tổng thanh toán</span>
                     <span className="text-2xl font-extrabold text-brand-700">{formatVnd(selectedTotal)}</span>
                  </p>
               </section>

               {selectedTotal > 0 && (
                  <CounterPaymentPanel
                     idPrefix="fnb-sales"
                     finalAmount={selectedTotal}
                     paymentMethod={paymentMethod}
                     cashInput={cashInput}
                     onChangePaymentMethod={setPaymentMethod}
                     onChangeCashInput={setCashInput}
                  />
               )}

               {checkoutMutation.isError && <Alert variant="error">{getErrorMessage(checkoutMutation.error)}</Alert>}
               <Button
                  fullWidth
                  className="h-12 text-base"
                  disabled={!canCheckout}
                  isLoading={checkoutMutation.isPending}
                  onClick={handleCheckout}
               >
                  Xác nhận đã thu tiền
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <header className="space-y-1 print:hidden">
            <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">Bán bắp nước</h1>
            <p className="text-sm text-ink-700">
               Chọn combo hoặc món, thu tiền và in hóa đơn cho khách mua bắp nước không kèm vé.
            </p>
         </header>
         {cinemaId === null ? (
            <Alert variant="error">
               {staffBranchSelection.isLoading
                  ? 'Đang tải chi nhánh làm việc...'
                  : 'Bạn chưa được gán chi nhánh nào để bán hàng.'}
            </Alert>
         ) : (
            renderBody()
         )}
      </div>
   );
}

export default FnbSalesPage;
