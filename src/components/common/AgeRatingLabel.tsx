import type { ReactElement } from 'react';
import AgeRatingBadge from '@/components/common/AgeRatingBadge';
import { AGE_RATING_DESCRIPTIONS } from '@/lib/movie/movieLabels';
import { cn } from '@/lib/common/utils';
import type { AgeRating } from '@/types/movie/movie';

interface AgeRatingLabelProps {
   ageRating: AgeRating;
   className?: string;
}

export function AgeRatingLabel({ ageRating, className }: AgeRatingLabelProps): ReactElement {
   return (
      <span className={cn('inline-flex items-center gap-2', className)}>
         <AgeRatingBadge ageRating={ageRating} className="shrink-0" />
         <span>{AGE_RATING_DESCRIPTIONS[ageRating]}</span>
      </span>
   );
}

export default AgeRatingLabel;
