import type { ReactElement } from 'react';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatDisplayDate, toVietnamDate, toVietnamTimeOfDay } from '@/lib/common/vietnamTime';
import { PAYMENT_METHOD_LABELS } from '@/lib/staff/operationsLabels';
import type { CounterMethodTotal, CounterTransaction, ShiftReport } from '@/types/staff/shift';

interface ShiftReportViewProps {
   shiftReport: ShiftReport;
}

interface ReportRowProps {
   label: string;
   value: string;
   isStrong?: boolean;
   tone?: 'normal' | 'danger' | 'success';
}

function ReportRow({ label, value, isStrong = false, tone = 'normal' }: ReportRowProps): ReactElement {
   const toneClassName: string =
      tone === 'danger' ? 'text-red-700' : tone === 'success' ? 'text-brand-700' : 'text-ink-900';
   return (
      <div className="flex justify-between gap-4 text-sm">
         <dt className="text-ink-600">{label}</dt>
         <dd className={isStrong ? `text-lg font-extrabold ${toneClassName}` : `font-semibold ${toneClassName}`}>
            {value}
         </dd>
      </div>
   );
}

function formatInstant(isoInstant: string): string {
   return `${toVietnamTimeOfDay(isoInstant)} ${formatDisplayDate(toVietnamDate(isoInstant))}`;
}

export function ShiftReportView({ shiftReport }: ShiftReportViewProps): ReactElement {
   const { shift, methodTotals, transactions, cashSales } = shiftReport;
   const isClosed: boolean = shift.status === 'CLOSED';
   const cashDifference: number | null = shift.cashDifference;

   return (
      <article className="space-y-5 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
         <header className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
               <h2 className="text-lg font-extrabold text-ink-900">Báo cáo ca làm việc</h2>
               <span
                  className={
                     isClosed
                        ? 'rounded-md bg-ink-100 px-2 py-0.5 text-xs font-extrabold text-ink-700'
                        : 'rounded-md bg-brand-100 px-2 py-0.5 text-xs font-extrabold text-brand-800'
                  }
               >
                  {isClosed ? 'Đã đóng ca' : 'Đang mở ca'}
               </span>
            </div>
            <p className="text-sm text-ink-700">
               {shift.staffName} · {shift.cinemaName}
            </p>
            <p className="text-xs text-ink-500">
               Mở lúc {formatInstant(shift.openedAt)}
               {shift.closedAt ? `, đóng lúc ${formatInstant(shift.closedAt)}` : ''}
            </p>
         </header>

         <section className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">Tổng thu theo phương thức</h3>
            {methodTotals.length === 0 ? (
               <p className="text-sm text-ink-500">Chưa có giao dịch nào trong ca.</p>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="text-left text-xs text-ink-500">
                           <th className="py-1 pr-3 font-semibold">Phương thức</th>
                           <th className="py-1 pr-3 text-right font-semibold">Đơn vé</th>
                           <th className="py-1 pr-3 text-right font-semibold">Bắp nước lẻ</th>
                           <th className="py-1 text-right font-semibold">Tổng</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-ink-100">
                        {methodTotals.map((counterMethodTotal: CounterMethodTotal) => (
                           <tr key={counterMethodTotal.paymentMethod}>
                              <td className="py-1.5 pr-3 font-semibold text-ink-900">
                                 {PAYMENT_METHOD_LABELS[counterMethodTotal.paymentMethod]}
                              </td>
                              <td className="py-1.5 pr-3 text-right">
                                 <span className="mr-2 rounded bg-ink-100 px-1.5 py-0.5 text-xs font-bold">
                                    {counterMethodTotal.bookingOrders} đơn
                                 </span>
                                 {formatVnd(counterMethodTotal.bookingAmount)}
                              </td>
                              <td className="py-1.5 pr-3 text-right">
                                 <span className="mr-2 rounded bg-ink-100 px-1.5 py-0.5 text-xs font-bold">
                                    {counterMethodTotal.fnbOrders} đơn
                                 </span>
                                 {formatVnd(counterMethodTotal.fnbAmount)}
                              </td>
                              <td className="py-1.5 text-right font-extrabold text-ink-900">
                                 {formatVnd(counterMethodTotal.bookingAmount + counterMethodTotal.fnbAmount)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </section>

         <dl className="space-y-1.5 border-t border-dashed border-ink-300 pt-4">
            <ReportRow label="Tổng doanh thu ca" value={formatVnd(shift.totalSales)} isStrong />
            <ReportRow label="Số đơn" value={String(shift.orderCount)} />
            <ReportRow label="Tiền đầu ca" value={formatVnd(shift.openingCash)} />
            <ReportRow label="Thu tiền mặt trong ca" value={formatVnd(cashSales)} />
            <ReportRow
               label={isClosed ? 'Tiền mặt cần có' : 'Tiền mặt dự kiến trong két'}
               value={formatVnd(shift.expectedCash ?? 0)}
            />
            {isClosed && shift.countedCash !== null && (
               <ReportRow label="Tiền mặt đếm được" value={formatVnd(shift.countedCash)} />
            )}
            {isClosed && cashDifference !== null && (
               <ReportRow
                  label="Chênh lệch tiền mặt"
                  value={`${cashDifference > 0 ? '+' : ''}${formatVnd(cashDifference)}`}
                  isStrong
                  tone={cashDifference === 0 ? 'success' : 'danger'}
               />
            )}
            {shift.note && <ReportRow label="Ghi chú" value={shift.note} />}
         </dl>

         <section className="space-y-2 border-t border-dashed border-ink-300 pt-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">Giao dịch trong ca</h3>
            {transactions.length === 0 ? (
               <p className="text-sm text-ink-500">Chưa có giao dịch.</p>
            ) : (
               <ul className="divide-y divide-ink-100 text-sm">
                  {transactions.map((counterTransaction: CounterTransaction) => (
                     <li key={counterTransaction.code} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5">
                        <span className="w-14 text-xs font-semibold text-ink-500">
                           {toVietnamTimeOfDay(counterTransaction.occurredAt)}
                        </span>
                        <span className="rounded bg-ink-100 px-1.5 py-0.5 text-xs font-bold text-ink-700">
                           {counterTransaction.type === 'TICKET' ? 'Vé' : 'Bắp nước'}
                        </span>
                        <span className="font-mono text-xs font-bold text-ink-900">{counterTransaction.code}</span>
                        <span className="text-xs text-ink-600">
                           {PAYMENT_METHOD_LABELS[counterTransaction.paymentMethod]}
                        </span>
                        <span className="ml-auto font-bold text-ink-900">{formatVnd(counterTransaction.amount)}</span>
                     </li>
                  ))}
               </ul>
            )}
         </section>
      </article>
   );
}

export default ShiftReportView;
