import {
   useMutation,
   useQuery,
   useQueryClient,
   type QueryClient,
   type UseMutationResult,
   type UseQueryResult,
} from '@tanstack/react-query';
import { ArrowLeft, Banknote, CreditCard, Landmark, Search, UserRound, X, type LucideIcon } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { getPendingBooking } from '@/api/booking/bookingApi';
import { checkoutTicketSale, lookupCustomer } from '@/api/staff/ticketSalesApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { pendingBookingKey } from '@/lib/booking/bookingQueryKeys';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { cn } from '@/lib/common/utils';
import { parseValidMoneyInput } from '@/lib/common/moneyInput';
import { formatClockRange, formatDisplayDate, toVietnamDate } from '@/lib/common/vietnamTime';
import type { BookingDetail } from '@/types/booking/bookingDetail';
import type {
   CounterCheckoutRequest,
   CounterPaymentMethod,
   CounterReceipt,
   CustomerLookup,
} from '@/types/staff/ticketSales';

interface PaymentMethodOption {
   method: CounterPaymentMethod;
   label: string;
   icon: LucideIcon;
}

const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
   { method: 'CASH', label: 'Tiền mặt', icon: Banknote },
   { method: 'CARD', label: 'Thẻ', icon: CreditCard },
   { method: 'TRANSFER', label: 'Chuyển khoản', icon: Landmark },
];

const QUICK_CASH_AMOUNTS: number[] = [50000, 100000, 200000, 500000];

interface SalesPaymentStepProps {
   cinemaId: number;
   onBack: () => void;
   onPaid: (counterReceipt: CounterReceipt) => void;
}

export function SalesPaymentStep({ cinemaId, onBack, onPaid }: SalesPaymentStepProps): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const [paymentMethod, setPaymentMethod] = useState<CounterPaymentMethod>('CASH');
   const [cashInput, setCashInput] = useState<string>('');
   const [keyword, setKeyword] = useState<string>('');
   const [customer, setCustomer] = useState<CustomerLookup | null>(null);
   const [lookupMessage, setLookupMessage] = useState<string | null>(null);
   const [receiptEmail, setReceiptEmail] = useState<string>('');
   const bookingQuery: UseQueryResult<BookingDetail | null> = useQuery<BookingDetail | null>({
      queryKey: pendingBookingKey(),
      queryFn: getPendingBooking,
      gcTime: 0,
   });
   const lookupMutation: UseMutationResult<CustomerLookup | null, unknown, string> = useMutation<
      CustomerLookup | null,
      unknown,
      string
   >({
      mutationFn: lookupCustomer,
      onSuccess(foundCustomer: CustomerLookup | null): void {
         setCustomer(foundCustomer);
         setLookupMessage(
            foundCustomer === null ? 'Không tìm thấy khách hàng. Kiểm tra lại hoặc bán cho khách vãng lai.' : null,
         );
      },
   });
   const checkoutMutation: UseMutationResult<CounterReceipt, unknown, CounterCheckoutRequest> = useMutation<
      CounterReceipt,
      unknown,
      CounterCheckoutRequest
   >({
      mutationFn: checkoutTicketSale,
      onSuccess(counterReceipt: CounterReceipt): void {
         void queryClient.invalidateQueries({ queryKey: pendingBookingKey() });
         onPaid(counterReceipt);
      },
   });
   const bookingDetail: BookingDetail | null | undefined = bookingQuery.data;
   const finalAmount: number = bookingDetail?.finalAmount ?? 0;
   const cashReceived: number | null = parseValidMoneyInput(cashInput);
   const changeAmount: number = cashReceived === null ? 0 : cashReceived - finalAmount;
   const isCashValid: boolean = paymentMethod !== 'CASH' || (cashReceived !== null && changeAmount >= 0);
   const canCheckout: boolean = bookingDetail !== null && bookingDetail !== undefined && isCashValid;

   function handleLookup(): void {
      const trimmedKeyword: string = keyword.trim();
      if (trimmedKeyword !== '') {
         lookupMutation.mutate(trimmedKeyword);
      }
   }

   function handleClearCustomer(): void {
      setCustomer(null);
      setKeyword('');
      setLookupMessage(null);
   }

   function handleCheckout(): void {
      const trimmedEmail: string = receiptEmail.trim();
      checkoutMutation.mutate({
         cinemaId,
         paymentMethod,
         cashReceived: paymentMethod === 'CASH' && cashReceived !== null ? cashReceived : undefined,
         customerUserId: customer?.id,
         receiptEmail: trimmedEmail === '' ? undefined : trimmedEmail,
      });
   }

   if (bookingQuery.isPending) {
      return <p className="text-sm text-ink-500">Đang tải đơn...</p>;
   }
   if (!bookingDetail) {
      return (
         <div className="space-y-4">
            <Alert variant="error">Không còn đơn giữ ghế hoặc đã hết thời gian giữ ghế. Vui lòng chọn lại ghế.</Alert>
            <Button variant="secondary" onClick={onBack}>
               Quay lại chọn ghế
            </Button>
         </div>
      );
   }

   return (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
         <div className="space-y-5">
            <button
               type="button"
               onClick={onBack}
               disabled={checkoutMutation.isPending}
               className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 disabled:opacity-60"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Quay lại
            </button>

            <section className="space-y-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
               <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-700">Khách hàng</h2>
               {customer ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-4">
                     <UserRound className="size-6 text-brand-700" aria-hidden="true" />
                     <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-ink-900">{customer.fullName}</p>
                        <p className="text-xs text-ink-600">
                           {customer.phone ?? 'Chưa có số điện thoại'} · {customer.email}
                        </p>
                     </div>
                     <span className="rounded-md bg-white px-2 py-0.5 text-xs font-extrabold text-brand-800">
                        {customer.tier}
                     </span>
                     <span className="rounded-md bg-accent-100 px-2 py-0.5 text-xs font-extrabold text-accent-700">
                        {customer.loyaltyPoints.toLocaleString('vi-VN')} điểm
                     </span>
                     <button
                        type="button"
                        onClick={handleClearCustomer}
                        aria-label="Bỏ chọn khách hàng"
                        className="grid size-8 place-items-center rounded-md text-ink-600 hover:bg-white"
                     >
                        <X className="size-4" aria-hidden="true" />
                     </button>
                  </div>
               ) : (
                  <div className="space-y-3">
                     <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-0 flex-1">
                           <TextField
                              id="sales-customer-keyword"
                              label="Số điện thoại hoặc email thành viên"
                              value={keyword}
                              onChange={setKeyword}
                              icon={Search}
                              placeholder="Bỏ trống nếu bán cho khách vãng lai"
                              optional
                           />
                        </div>
                        <Button
                           variant="secondary"
                           className="h-11"
                           isLoading={lookupMutation.isPending}
                           disabled={keyword.trim() === ''}
                           onClick={handleLookup}
                        >
                           Tìm khách
                        </Button>
                     </div>
                     {lookupMessage && <Alert variant="info">{lookupMessage}</Alert>}
                     {lookupMutation.isError && <Alert variant="error">{getErrorMessage(lookupMutation.error)}</Alert>}
                     <p className="text-xs text-ink-500">Đang bán cho khách vãng lai, đơn này không tích điểm.</p>
                  </div>
               )}
               <TextField
                  id="sales-receipt-email"
                  label="Gửi vé điện tử qua email"
                  type="email"
                  value={receiptEmail}
                  onChange={setReceiptEmail}
                  placeholder={customer ? 'Mặc định gửi về email tài khoản' : 'Khách không cần thì để trống'}
                  optional
               />
            </section>

            <section className="space-y-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
               <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-700">Thanh toán</h2>
               <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Phương thức thanh toán">
                  {PAYMENT_METHOD_OPTIONS.map((paymentMethodOption) => {
                     const MethodIcon: LucideIcon = paymentMethodOption.icon;
                     const isSelected: boolean = paymentMethodOption.method === paymentMethod;
                     return (
                        <button
                           key={paymentMethodOption.method}
                           type="button"
                           role="radio"
                           aria-checked={isSelected}
                           onClick={() => setPaymentMethod(paymentMethodOption.method)}
                           className={cn(
                              'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-extrabold transition-colors',
                              isSelected
                                 ? 'border-brand-600 bg-brand-50 text-brand-800'
                                 : 'border-ink-200 text-ink-700 hover:bg-ink-50',
                           )}
                        >
                           <MethodIcon className="size-5" aria-hidden="true" />
                           {paymentMethodOption.label}
                        </button>
                     );
                  })}
               </div>
               {paymentMethod === 'CASH' && (
                  <div className="space-y-3">
                     <TextField
                        id="sales-cash-received"
                        label="Tiền khách đưa"
                        value={cashInput}
                        onChange={setCashInput}
                        placeholder="Nhập số tiền khách đưa"
                        error={
                           cashInput.trim() !== '' && cashReceived === null
                              ? 'Số tiền không hợp lệ'
                              : cashReceived !== null && changeAmount < 0
                                ? 'Số tiền khách đưa chưa đủ'
                                : undefined
                        }
                     />
                     <div className="flex flex-wrap gap-2">
                        <button
                           type="button"
                           onClick={() => setCashInput(String(finalAmount))}
                           className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50"
                        >
                           Đủ tiền
                        </button>
                        {QUICK_CASH_AMOUNTS.filter((quickAmount) => quickAmount >= finalAmount).map((quickAmount) => (
                           <button
                              key={quickAmount}
                              type="button"
                              onClick={() => setCashInput(String(quickAmount))}
                              className="rounded-md border border-ink-300 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50"
                           >
                              {formatVnd(quickAmount)}
                           </button>
                        ))}
                     </div>
                     <p className="flex items-center justify-between rounded-xl bg-accent-50 px-4 py-3 text-sm font-bold text-ink-900">
                        <span>Tiền thối lại khách</span>
                        <span className="text-xl font-extrabold text-accent-700">
                           {formatVnd(cashReceived !== null && changeAmount > 0 ? changeAmount : 0)}
                        </span>
                     </p>
                  </div>
               )}
               {paymentMethod === 'CARD' && (
                  <p className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
                     Quẹt thẻ trên máy POS đúng số tiền {formatVnd(finalAmount)} rồi bấm xác nhận.
                  </p>
               )}
               {paymentMethod === 'TRANSFER' && (
                  <p className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
                     Chỉ bấm xác nhận sau khi đã nhận được khoản chuyển {formatVnd(finalAmount)} vào tài khoản rạp.
                  </p>
               )}
            </section>
         </div>

         <aside className="space-y-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
            <div className="space-y-1">
               <h2 className="text-lg font-extrabold uppercase leading-tight text-ink-900">
                  {bookingDetail.showtime.movieTitle}
               </h2>
               <p className="text-sm text-ink-700">
                  {bookingDetail.showtime.hallName} · {bookingDetail.showtime.screenType}
               </p>
               <p className="text-sm text-ink-700">
                  {formatDisplayDate(toVietnamDate(bookingDetail.showtime.startTime))} ·{' '}
                  <span className="font-bold">
                     {formatClockRange(bookingDetail.showtime.startTime, bookingDetail.showtime.endTime)}
                  </span>
               </p>
            </div>
            <ul className="divide-y divide-ink-100 text-sm">
               {bookingDetail.seats.map((bookingSeat) => (
                  <li key={bookingSeat.seatId} className="flex justify-between py-1.5">
                     <span className="font-bold text-ink-900">Ghế {bookingSeat.label}</span>
                     <span>{formatVnd(bookingSeat.price)}</span>
                  </li>
               ))}
               {bookingDetail.fnbLines.map((bookingFnbLine) => (
                  <li
                     key={`${bookingFnbLine.comboId ?? ''}-${bookingFnbLine.itemId ?? ''}`}
                     className="flex justify-between gap-3 py-1.5"
                  >
                     <span>
                        {bookingFnbLine.quantity} × {bookingFnbLine.name}
                     </span>
                     <span>{formatVnd(bookingFnbLine.lineAmount)}</span>
                  </li>
               ))}
            </ul>
            <p className="flex items-center justify-between border-t border-ink-200 pt-3 text-sm font-bold text-ink-900">
               <span>Tổng thanh toán</span>
               <span className="text-2xl font-extrabold text-brand-700">{formatVnd(finalAmount)}</span>
            </p>
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
         </aside>
      </div>
   );
}

export default SalesPaymentStep;
