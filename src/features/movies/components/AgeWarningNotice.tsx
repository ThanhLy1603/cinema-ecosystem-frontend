import { ShieldAlert, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import { AGE_RATING_DESCRIPTIONS, AGE_RATING_WARNINGS } from '@/lib/movie/movieLabels';
import { cn } from '@/lib/common/utils';
import type { AgeRating } from '@/types/movie/movie';

interface AgeWarningNoticeProps {
   ageRating: AgeRating;
}

export function AgeWarningNotice({ ageRating }: AgeWarningNoticeProps): ReactElement {
   const warning: string | null = AGE_RATING_WARNINGS[ageRating];
   const Icon: LucideIcon = warning === null ? ShieldCheck : ShieldAlert;

   return (
      <div
         role={warning === null ? 'note' : 'alert'}
         className={cn(
            'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm',
            warning === null
               ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
               : 'border-danger-200 bg-danger-50 text-danger-900',
         )}
      >
         <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
         <div className="space-y-1">
            <p className="flex items-center gap-2 font-bold">
               <AgeRatingBadge ageRating={ageRating} />
               {AGE_RATING_DESCRIPTIONS[ageRating]}
            </p>
            {warning !== null && <p>{warning} Vui lòng mang theo giấy tờ tùy thân khi đến rạp.</p>}
         </div>
      </div>
   );
}

export default AgeWarningNotice;
