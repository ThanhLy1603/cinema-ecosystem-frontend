import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/common/utils';

interface BookingStepperProps {
   currentStepIndex: number;
   stepPaths?: (string | null)[];
}

const BOOKING_STEP_LABELS: string[] = ['Suất chiếu', 'Chọn ghế', 'Bắp nước', 'Thanh toán'];

export function BookingStepper({ currentStepIndex, stepPaths = [] }: BookingStepperProps): ReactElement {
   return (
      <ol
         aria-label="Các bước đặt vé"
         className="grid grid-cols-4 overflow-hidden rounded-xl border border-ink-200 bg-white text-center text-xs shadow-xs sm:text-sm"
      >
         {BOOKING_STEP_LABELS.map((stepLabel, stepIndex) => {
            const stepPath: string | null = stepIndex < currentStepIndex ? (stepPaths[stepIndex] ?? null) : null;
            const stepClassName: string = cn(
               'block border-b-2 px-2 py-3 font-bold transition-colors',
               stepIndex === currentStepIndex && 'border-brand-500 bg-brand-50/60 text-brand-600',
               stepIndex < currentStepIndex && 'border-brand-200 text-brand-700',
               stepPath !== null && 'hover:bg-brand-50',
               stepIndex > currentStepIndex && 'border-transparent text-ink-500',
            );
            return (
               <li key={stepLabel} aria-current={stepIndex === currentStepIndex ? 'step' : undefined}>
                  {stepPath !== null ? (
                     <Link to={stepPath} className={stepClassName}>
                        {stepIndex + 1}. {stepLabel}
                     </Link>
                  ) : (
                     <span className={stepClassName}>
                        {stepIndex + 1}. {stepLabel}
                     </span>
                  )}
               </li>
            );
         })}
      </ol>
   );
}

export default BookingStepper;
