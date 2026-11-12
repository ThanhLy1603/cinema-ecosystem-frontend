import { Star } from 'lucide-react';
import type { ReactElement } from 'react';
import type { MovieRatingSummary } from '@/types/movie/movie';

interface StarRatingProps {
   movieRatingSummary: MovieRatingSummary | undefined;
}

const STAR_COUNT: number = 5;
const RATING_SCALE_DIVISOR: number = 2;
const HALF_STEP: number = 0.5;

function clampFraction(fraction: number): number {
   return Math.min(Math.max(fraction, 0), 1);
}

export function StarRating({ movieRatingSummary }: StarRatingProps): ReactElement {
   const hasRating: boolean = movieRatingSummary !== undefined && movieRatingSummary.reviewCount > 0;
   const starValue: number = hasRating
      ? Math.round((movieRatingSummary?.averageRating ?? 0) / RATING_SCALE_DIVISOR / HALF_STEP) * HALF_STEP
      : 0;
   const label: string = hasRating
      ? `${starValue.toFixed(1)} trên 5 sao, ${movieRatingSummary?.reviewCount ?? 0} lượt đánh giá`
      : 'Chưa có đánh giá';

   return (
      <div className="flex items-center gap-1.5" role="img" aria-label={label} title={label}>
         <span className="flex items-center gap-0.5">
            {Array.from({ length: STAR_COUNT }, (_, starIndex) => (
               <span key={starIndex} className="relative inline-block size-4">
                  <Star className="absolute inset-0 size-4 text-ink-300" aria-hidden="true" />
                  <span
                     className="absolute inset-y-0 left-0 overflow-hidden"
                     style={{ width: `${clampFraction(starValue - starIndex) * 100}%` }}
                  >
                     <Star className="size-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                  </span>
               </span>
            ))}
         </span>
         <span className="text-xs text-ink-600">
            {hasRating ? `${starValue.toFixed(1)} (${movieRatingSummary?.reviewCount ?? 0})` : 'Chưa có đánh giá'}
         </span>
      </div>
   );
}

export default StarRating;
