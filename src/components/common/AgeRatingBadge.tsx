import type { ReactElement } from 'react';
import { AGE_RATING_BADGE_CLASSES, AGE_RATING_DESCRIPTIONS } from '@/lib/movieLabels';
import { cn } from '@/lib/utils';
import type { AgeRating } from '@/types/movie';

interface AgeRatingBadgeProps {
   ageRating: AgeRating;
   className?: string;
}

export function AgeRatingBadge({ ageRating, className }: AgeRatingBadgeProps): ReactElement {
   return (
      <span
         title={AGE_RATING_DESCRIPTIONS[ageRating]}
         className={cn(
            'inline-flex min-w-9 items-center justify-center rounded-md px-2 py-0.5 text-xs font-extrabold tracking-wide',
            AGE_RATING_BADGE_CLASSES[ageRating],
            className,
         )}
      >
         {ageRating}
      </span>
   );
}

export default AgeRatingBadge;
