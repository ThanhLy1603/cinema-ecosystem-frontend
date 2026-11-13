import { parseValidMoneyInput } from '@/lib/common/moneyInput';
import type { CounterPaymentMethod } from '@/types/staff/ticketSales';

export interface CounterPaymentEvaluation {
   cashReceived: number | null;
   changeAmount: number;
   isValid: boolean;
}

export function evaluateCounterPayment(
   paymentMethod: CounterPaymentMethod,
   cashInput: string,
   finalAmount: number,
): CounterPaymentEvaluation {
   const cashReceived: number | null = parseValidMoneyInput(cashInput);
   const changeAmount: number = cashReceived === null ? 0 : cashReceived - finalAmount;
   return {
      cashReceived,
      changeAmount,
      isValid: paymentMethod !== 'CASH' || (cashReceived !== null && changeAmount >= 0),
   };
}
