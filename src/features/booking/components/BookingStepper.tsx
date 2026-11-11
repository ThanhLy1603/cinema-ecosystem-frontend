import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';

interface BookingStepperProps {
   currentStepIndex: number;
}

const BOOKING_STEP_LABELS: string[] = ['Suất chiếu', 'Chọn ghế', 'Bắp nước', 'Thanh toán'];

export function BookingStepper({ currentStepIndex }: BookingStepperProps): ReactElement {
   return (
      <ol
         aria-label="Các bước đặt vé"
         className="grid grid-cols-4 overflow-hidden rounded-xl border border-ink-200 bg-white text-center text-xs shadow-xs sm:text-sm"
      >
         {BOOKING_STEP_LABELS.map((stepLabel, stepIndex) => (
            <li
               key={stepLabel}
               aria-current={stepIndex === currentStepIndex ? 'step' : undefined}
               className={cn(
                  'border-b-2 px-2 py-3 font-bold transition-colors',
                  stepIndex === currentStepIndex && 'border-brand-500 bg-brand-50/60 text-brand-600',
                  stepIndex < currentStepIndex && 'border-brand-200 text-brand-700',
                  stepIndex > currentStepIndex && 'border-transparent text-ink-500',
               )}
            >
               {stepIndex + 1}. {stepLabel}
            </li>
         ))}
      </ol>
   );
}

export default BookingStepper;
