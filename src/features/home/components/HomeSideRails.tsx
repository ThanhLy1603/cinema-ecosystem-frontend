import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Clapperboard, Clock, Gift, UtensilsCrossed } from 'lucide-react';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getPublicPromotions } from '@/api/promotion/promotionApi';
import AgeRatingLabel from '@/components/common/AgeRatingLabel';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatDuration, formatReleaseDate } from '@/lib/movie/movieFormat';
import { getMovieDetailPath } from '@/lib/movie/moviePath';
import { formatDiscountValue, formatPromotionEndDate } from '@/lib/promotion/promotionFormat';
import { PUBLIC_PROMOTIONS_KEY } from '@/lib/promotion/promotionQueryKeys';
import type { FnbCombo } from '@/types/fnb/fnb';
import type { Movie } from '@/types/movie/movie';
import type { PublicPromotion } from '@/types/promotion/promotion';

const MAX_RAIL_COMBOS: number = 2;

interface RailFrameProps {
   children: ReactNode;
}

interface RailLabelProps {
   label: string;
}

function RailFrame({ children }: RailFrameProps): ReactElement {
   return (
      <aside className="hidden pt-12 xl:block">
         <div className="sticky top-24 space-y-5">{children}</div>
      </aside>
   );
}

function RailLabel({ label }: RailLabelProps): ReactElement {
   return <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">{label}</p>;
}

interface RailMovieCardProps {
   movie: Movie;
}

function RailMovieCard({ movie }: RailMovieCardProps): ReactElement {
   const imageUrl: string | null = movie.posterUrl ?? movie.bannerUrl;
   const isComingSoon: boolean = movie.status === 'COMING_SOON';

   return (
      <Link
         to={getMovieDetailPath(movie.slug)}
         className="group block space-y-3 rounded-2xl bg-white p-3 shadow-md ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
         <RailLabel label={isComingSoon ? 'Phim sắp chiếu' : 'Phim đáng xem'} />
         <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-ink-100">
            {imageUrl ? (
               <img
                  src={imageUrl}
                  alt={`Poster phim ${movie.title}`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            ) : (
               <span className="grid size-full place-items-center text-ink-300">
                  <Clapperboard className="size-10" aria-hidden="true" />
               </span>
            )}
         </div>
         <div className="space-y-1.5">
            <h3 className="line-clamp-2 text-sm font-extrabold uppercase leading-snug text-ink-900 group-hover:text-brand-600">
               {movie.title}
            </h3>
            <div className="space-y-1 text-xs text-ink-700">
               <AgeRatingLabel ageRating={movie.rated} />
               <p className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {formatDuration(movie.durationMinutes)}
               </p>
            </div>
            {isComingSoon && (
               <p className="text-xs font-semibold text-accent-600">
                  Khởi chiếu {formatReleaseDate(movie.releaseDate)}
               </p>
            )}
         </div>
      </Link>
   );
}

function RailPromotionCard(): ReactElement {
   const promotionsQuery: UseQueryResult<PublicPromotion[]> = useQuery<PublicPromotion[]>({
      queryKey: PUBLIC_PROMOTIONS_KEY,
      queryFn: getPublicPromotions,
   });
   const publicPromotion: PublicPromotion | undefined = promotionsQuery.data?.[0];

   return (
      <Link
         to="/promotions"
         className="group block space-y-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
         <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-100">
            <Gift className="size-4" aria-hidden="true" />
            Khuyến mãi
         </p>
         {publicPromotion ? (
            <>
               <p className="text-3xl font-black leading-none">Giảm {formatDiscountValue(publicPromotion)}</p>
               <p className="line-clamp-3 text-sm font-semibold leading-snug">{publicPromotion.title}</p>
               {publicPromotion.code && (
                  <p className="inline-block rounded-lg border border-dashed border-white/70 px-2.5 py-1 font-mono text-xs font-bold">
                     {publicPromotion.code}
                  </p>
               )}
               <p className="text-[11px] text-brand-100">{formatPromotionEndDate(publicPromotion)}</p>
            </>
         ) : (
            <>
               <p className="text-2xl font-black leading-tight">Tích điểm 5% mỗi đơn vé</p>
               <p className="text-sm leading-snug text-brand-100">
                  Điểm thành viên được cộng sau mỗi lần thanh toán thành công.
               </p>
            </>
         )}
         <p className="text-xs font-bold uppercase tracking-wide group-hover:underline">Xem ưu đãi</p>
      </Link>
   );
}

interface RailComboCardProps {
   fnbCombo: FnbCombo;
}

function RailComboCard({ fnbCombo }: RailComboCardProps): ReactElement {
   return (
      <Link
         to="/fnb"
         className="group block space-y-3 rounded-2xl bg-white p-3 shadow-md ring-1 ring-ink-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
         <RailLabel label="Combo bắp nước" />
         <div className="aspect-[4/3] overflow-hidden rounded-xl bg-ink-100">
            {fnbCombo.imageUrl ? (
               <img
                  src={fnbCombo.imageUrl}
                  alt={fnbCombo.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
               />
            ) : (
               <span className="grid size-full place-items-center text-ink-300">
                  <UtensilsCrossed className="size-10" aria-hidden="true" />
               </span>
            )}
         </div>
         <div className="space-y-1">
            <h3 className="text-sm font-extrabold uppercase leading-snug text-ink-900 group-hover:text-brand-600">
               {fnbCombo.name}
            </h3>
            {fnbCombo.description && <p className="line-clamp-2 text-xs text-ink-600">{fnbCombo.description}</p>}
            <p className="text-lg font-extrabold text-brand-700">{formatVnd(fnbCombo.price)}</p>
         </div>
      </Link>
   );
}

interface HomeLeftRailProps {
   movie: Movie | undefined;
}

export function HomeLeftRail({ movie }: HomeLeftRailProps): ReactElement {
   return (
      <RailFrame>
         {movie && <RailMovieCard movie={movie} />}
         <RailPromotionCard />
      </RailFrame>
   );
}

interface HomeRightRailProps {
   fnbCombos: FnbCombo[];
}

export function HomeRightRail({ fnbCombos }: HomeRightRailProps): ReactElement {
   return (
      <RailFrame>
         {fnbCombos.slice(0, MAX_RAIL_COMBOS).map((fnbCombo) => (
            <RailComboCard key={fnbCombo.id} fnbCombo={fnbCombo} />
         ))}
      </RailFrame>
   );
}
