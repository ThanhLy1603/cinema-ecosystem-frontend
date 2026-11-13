import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import type { ReactElement } from 'react';
import { saveFnbReceiptFile } from '@/api/staff/fnbSalesApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import type { CounterFnbReceipt, CounterFnbReceiptLine } from '@/types/staff/fnbSales';
import type { CounterReceiptFile } from '@/types/staff/ticketSales';
import { PAYMENT_METHOD_LABELS } from '@/lib/staff/operationsLabels';

interface FnbSalesReceiptProps {
   counterFnbReceipt: CounterFnbReceipt;
   onNewSale: () => void;
}

interface ReceiptRowProps {
   label: string;
   value: string;
   isStrong?: boolean;
}

function ReceiptRow({ label, value, isStrong = false }: ReceiptRowProps): ReactElement {
   return (
      <div className="flex justify-between gap-4 text-sm">
         <dt className="text-ink-600">{label}</dt>
         <dd className={isStrong ? 'text-lg font-extrabold text-ink-900' : 'font-semibold text-ink-900'}>{value}</dd>
      </div>
   );
}

export function FnbSalesReceipt({ counterFnbReceipt, onNewSale }: FnbSalesReceiptProps): ReactElement {
   const saveReceiptFileMutation: UseMutationResult<CounterReceiptFile, unknown, void> = useMutation<
      CounterReceiptFile,
      unknown,
      void
   >({
      mutationFn: (): Promise<CounterReceiptFile> => saveFnbReceiptFile(counterFnbReceipt.orderCode),
   });

   function handlePrint(): void {
      saveReceiptFileMutation.mutate(undefined, {
         onSettled: (): void => {
            window.print();
         },
      });
   }

   return (
      <div className="space-y-5">
         <div className="rounded-xl border-l-4 border-brand-600 bg-brand-50 px-4 py-3 text-brand-800 print:hidden">
            <h2 className="text-base font-extrabold">Đã bán bắp nước thành công</h2>
            <p className="text-xs font-medium">
               Đơn {counterFnbReceipt.orderCode} đã thanh toán {formatVnd(counterFnbReceipt.totalAmount)}.
               {counterFnbReceipt.changeAmount !== null && counterFnbReceipt.changeAmount > 0
                  ? ` Thối lại khách ${formatVnd(counterFnbReceipt.changeAmount)}.`
                  : ''}
            </p>
         </div>

         <article
            id="counter-receipt-print"
            className="mx-auto max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-md ring-1 ring-ink-100"
         >
            <header className="space-y-1 text-center">
               <p className="text-lg font-extrabold text-ink-900">CinemaSphere</p>
               <p className="text-sm text-ink-700">{counterFnbReceipt.cinemaName}</p>
               <p className="text-xs text-ink-500">Hóa đơn bắp nước bán tại quầy</p>
            </header>

            <section className="space-y-1 border-t border-dashed border-ink-300 pt-4">
               <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">Bắp nước</h3>
               <ul className="space-y-1 text-sm text-ink-800">
                  {counterFnbReceipt.lines.map((counterFnbReceiptLine: CounterFnbReceiptLine) => (
                     <li
                        key={`${counterFnbReceiptLine.comboId ?? ''}-${counterFnbReceiptLine.itemId ?? ''}`}
                        className="flex justify-between gap-4"
                     >
                        <span>
                           {counterFnbReceiptLine.quantity} × {counterFnbReceiptLine.name}
                        </span>
                        <span>{formatVnd(counterFnbReceiptLine.lineAmount)}</span>
                     </li>
                  ))}
               </ul>
            </section>

            <dl className="space-y-1.5 border-t border-dashed border-ink-300 pt-4">
               <ReceiptRow label="Tổng thanh toán" value={formatVnd(counterFnbReceipt.totalAmount)} isStrong />
               <ReceiptRow
                  label="Hình thức"
                  value={PAYMENT_METHOD_LABELS[counterFnbReceipt.paymentMethod] ?? counterFnbReceipt.paymentMethod}
               />
               {counterFnbReceipt.cashReceived !== null && (
                  <ReceiptRow label="Tiền khách đưa" value={formatVnd(counterFnbReceipt.cashReceived)} />
               )}
               {counterFnbReceipt.changeAmount !== null && (
                  <ReceiptRow label="Tiền thối" value={formatVnd(counterFnbReceipt.changeAmount)} />
               )}
            </dl>

            <section className="space-y-1 border-t border-dashed border-ink-300 pt-4 text-center">
               <p className="font-mono text-base font-extrabold text-ink-900">{counterFnbReceipt.orderCode}</p>
               <p className="text-xs text-ink-600">Khách nhận bắp nước ngay tại quầy.</p>
            </section>

            <footer className="space-y-0.5 border-t border-dashed border-ink-300 pt-4 text-center text-xs text-ink-500">
               <p>
                  {toVietnamTimeOfDay(counterFnbReceipt.paidAt)} ·{' '}
                  {formatDisplayDate(toVietnamDate(counterFnbReceipt.paidAt))}
               </p>
               {counterFnbReceipt.soldByStaffName && <p>Nhân viên bán: {counterFnbReceipt.soldByStaffName}</p>}
            </footer>
         </article>

         {saveReceiptFileMutation.isSuccess && (
            <div className="mx-auto max-w-md print:hidden">
               <Alert variant="success">
                  Đã lưu hóa đơn {saveReceiptFileMutation.data.fileName} vào thư mục
                  <span className="mt-0.5 block break-all font-mono text-xs">
                     {saveReceiptFileMutation.data.directory}
                  </span>
               </Alert>
            </div>
         )}
         {saveReceiptFileMutation.isError && (
            <div className="mx-auto max-w-md print:hidden">
               <Alert variant="error">{getErrorMessage(saveReceiptFileMutation.error)}</Alert>
            </div>
         )}

         <div className="flex flex-wrap justify-center gap-3 print:hidden">
            <Button
               className="h-12 px-6 text-base"
               icon={<Printer className="size-5" aria-hidden="true" />}
               isLoading={saveReceiptFileMutation.isPending}
               onClick={handlePrint}
            >
               In hóa đơn
            </Button>
            <Button variant="secondary" className="h-12 px-6 text-base" onClick={onNewSale}>
               Bán đơn mới
            </Button>
         </div>
      </div>
   );
}

export default FnbSalesReceipt;
