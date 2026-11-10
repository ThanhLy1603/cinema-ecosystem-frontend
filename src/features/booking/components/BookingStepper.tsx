import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/lib/common/utils';

interface BookingStepperProps {
   currentStepIndex: number;
}

const BOOKING_STEP_LABELS: string[] = ['Chọn suất', 'Chọn ghế', 'Bắp nước', 'Thanh toán'];

interface BookingStepItemProps {
   stepLabel: string;
   stepIndex: number;
   currentStepIndex: number;
}

function BookingStepItem({ stepLabel, stepIndex, currentStepIndex }: BookingStepItemProps): ReactElement {
   const isDone: boolean = stepIndex < currentStepIndex;
   const isCurrent: boolean = stepIndex === currentStepIndex;
   return (
      <li aria-current={isCurrent ? 'step' : undefined} className="flex shrink-0 items-center gap-2">
         <span
            className={cn(
               'grid size-7 place-items-center rounded-full text-xs font-bold',
               isCurrent && 'bg-brand-600 text-white shadow-glow',
               isDone && 'bg-brand-100 text-brand-700',
               !isCurrent && !isDone && 'bg-ink-100 text-ink-500',
            )}
         >
            {isDone ? <Check className="size-4" aria-hidden="true" /> : stepIndex + 1}
         </span>
         <span className={cn('text-sm font-semibold', isCurrent ? 'text-ink-900' : 'text-ink-500')}>{stepLabel}</span>
         {stepIndex < BOOKING_STEP_LABELS.length - 1 && (
            <span className="mx-1 h-px w-6 bg-ink-200 sm:w-10" aria-hidden="true" />
         )}
      </li>
   );
}

export function BookingStepper({ currentStepIndex }: BookingStepperProps): ReactElement {
   return (
      <ol aria-label="Các bước đặt vé" className="flex items-center gap-2 overflow-x-auto pb-1">
         {BOOKING_STEP_LABELS.map((stepLabel, stepIndex) => (
            <BookingStepItem
               key={stepLabel}
               stepLabel={stepLabel}
               stepIndex={stepIndex}
               currentStepIndex={currentStepIndex}
            />
         ))}
      </ol>
   );
}

export default BookingStepper;
