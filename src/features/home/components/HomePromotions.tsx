import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Check, Copy } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { getPublicPromotions } from '@/api/promotionApi';
import Reveal from '@/components/common/Reveal';
import SectionBanner from '@/components/common/SectionBanner';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { cn } from '@/lib/common/utils';
import { describePromotionLimits, formatDiscountValue, formatPromotionEndDate } from '@/lib/promotion/promotionFormat';
import { PUBLIC_PROMOTIONS_KEY } from '@/lib/promotion/promotionQueryKeys';
import type { PublicPromotion } from '@/types/promotion/promotion';

const SKELETON_KEYS: string[] = ['skeleton-1', 'skeleton-2', 'skeleton-3'];
const COPIED_FEEDBACK_MILLISECONDS: number = 2000;

interface PromotionCardProps {
   publicPromotion: PublicPromotion;
}

function PromotionCard({ publicPromotion }: PromotionCardProps): ReactElement {
   const [isCopied, setIsCopied] = useState<boolean>(false);
   const limits: string[] = describePromotionLimits(publicPromotion);
   const discountLabel: string = formatDiscountValue(publicPromotion);

   function handleCopyCode(): void {
      if (publicPromotion.code === null) {
         return;
      }
      void navigator.clipboard?.writeText(publicPromotion.code);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MILLISECONDS);
   }

   return (
      <article className="flex h-full overflow-hidden rounded-2xl border border-brand-100 bg-white transition-all hover:shadow-xl">
         <div className="flex w-28 shrink-0 flex-col items-center justify-center bg-brand-600 px-2 text-center text-white sm:w-32">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-100">Giảm</span>
            <span
               className={cn(
                  'font-extrabold leading-tight',
                  discountLabel.length > 5 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl',
               )}
            >
               {discountLabel}
            </span>
         </div>
         <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
            <div className="space-y-1.5">
               <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink-900">{publicPromotion.title}</h3>
               {limits.length > 0 && (
                  <ul className="space-y-0.5 text-xs text-ink-600">
                     {limits.map((limit) => (
                        <li key={limit}>{limit}</li>
                     ))}
                  </ul>
               )}
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
               {publicPromotion.code ? (
                  <button
                     type="button"
                     onClick={handleCopyCode}
                     aria-label={`Sao chép mã ${publicPromotion.code}`}
                     className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand-600 bg-brand-50 px-3 py-1.5 font-mono text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                     {publicPromotion.code}
                     {isCopied ? (
                        <Check className="size-3.5" aria-hidden="true" />
                     ) : (
                        <Copy className="size-3.5" aria-hidden="true" />
                     )}
                  </button>
               ) : (
                  <span className="text-xs font-semibold text-brand-700">Áp dụng tự động</span>
               )}
               <span className="text-[11px] font-semibold text-ink-500">{formatPromotionEndDate(publicPromotion)}</span>
            </div>
         </div>
      </article>
   );
}

export function HomePromotions(): ReactElement {
   const promotionsQuery: UseQueryResult<PublicPromotion[]> = useQuery<PublicPromotion[]>({
      queryKey: PUBLIC_PROMOTIONS_KEY,
      queryFn: getPublicPromotions,
   });
   const publicPromotions: PublicPromotion[] = promotionsQuery.data ?? [];

   return (
      <section
         id="promotion-section"
         aria-labelledby="home-promotions-heading"
         className="px-4 py-10 sm:px-6 sm:py-12 lg:px-12"
      >
         <div className="mx-auto max-w-6xl">
            <SectionBanner title="Ưu đãi đặc biệt" headingId="home-promotions-heading" />
            {promotionsQuery.isError && <Alert variant="error">{getErrorMessage(promotionsQuery.error)}</Alert>}
            {promotionsQuery.isPending && (
               <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                  {SKELETON_KEYS.map((skeletonKey) => (
                     <div key={skeletonKey} className="h-36 animate-pulse rounded-2xl bg-brand-100" />
                  ))}
               </div>
            )}
            {promotionsQuery.isSuccess && publicPromotions.length === 0 && (
               <p className="rounded-2xl border border-brand-100 bg-white py-12 text-center text-sm text-ink-500">
                  Hiện chưa có chương trình khuyến mại nào đang diễn ra. Vui lòng quay lại sau.
               </p>
            )}
            {publicPromotions.length > 0 && (
               <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {publicPromotions.map((publicPromotion, promotionIndex) => (
                     <Reveal key={publicPromotion.id} delayMs={(promotionIndex % 3) * 90} className="h-full">
                        <PromotionCard publicPromotion={publicPromotion} />
                     </Reveal>
                  ))}
               </div>
            )}
         </div>
      </section>
   );
}

export default HomePromotions;
