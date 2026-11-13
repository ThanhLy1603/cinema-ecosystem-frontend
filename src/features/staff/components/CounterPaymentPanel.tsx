import { Banknote, CreditCard, Landmark, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import TextField from '@/components/ui/TextField';
import { formatVnd } from '@/lib/common/currencyFormat';
import { cn } from '@/lib/common/utils';
import { evaluateCounterPayment, type CounterPaymentEvaluation } from '@/lib/staff/counterPayment';
import type { CounterPaymentMethod } from '@/types/staff/ticketSales';

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

interface CounterPaymentPanelProps {
   idPrefix: string;
   finalAmount: number;
   paymentMethod: CounterPaymentMethod;
   cashInput: string;
   onChangePaymentMethod: (paymentMethod: CounterPaymentMethod) => void;
   onChangeCashInput: (cashInput: string) => void;
}

export function CounterPaymentPanel({
   idPrefix,
   finalAmount,
   paymentMethod,
   cashInput,
   onChangePaymentMethod,
   onChangeCashInput,
}: CounterPaymentPanelProps): ReactElement {
   const counterPaymentEvaluation: CounterPaymentEvaluation = evaluateCounterPayment(
      paymentMethod,
      cashInput,
      finalAmount,
   );
   const { cashReceived, changeAmount } = counterPaymentEvaluation;

   return (
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
                     onClick={() => onChangePaymentMethod(paymentMethodOption.method)}
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
                  id={`${idPrefix}-cash-received`}
                  label="Tiền khách đưa"
                  value={cashInput}
                  onChange={onChangeCashInput}
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
                     onClick={() => onChangeCashInput(String(finalAmount))}
                     className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50"
                  >
                     Đủ tiền
                  </button>
                  {QUICK_CASH_AMOUNTS.filter((quickAmount) => quickAmount >= finalAmount).map((quickAmount) => (
                     <button
                        key={quickAmount}
                        type="button"
                        onClick={() => onChangeCashInput(String(quickAmount))}
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
   );
}

export default CounterPaymentPanel;
