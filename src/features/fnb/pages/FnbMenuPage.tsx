import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { getPublicFnbMenu } from '@/api/fnbApi';
import fnbBannerImageUrl from '@/assets/banners/fnb-banner.jpg';
import FnbComboCard from '@/components/common/FnbComboCard';
import Reveal from '@/components/common/Reveal';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { cn } from '@/lib/common/utils';
import { FNB_CATEGORIES, FNB_CATEGORY_LABELS } from '@/lib/fnb/fnbLabels';
import { PUBLIC_FNB_KEY } from '@/lib/fnb/fnbQueryKeys';
import { useFnbBestSellers, type FnbBestSellerIds } from '@/lib/fnb/useFnbBestSellers';
import type { FnbCategory, FnbItem, FnbMenu } from '@/types/fnb/fnb';
import FnbItemCard from '../components/FnbItemCard';

type FnbFilter = 'ALL' | 'COMBO' | FnbCategory;

interface FnbFilterTab {
   filter: FnbFilter;
   label: string;
}

const SECTION_HEADING_CLASS_NAME: string = 'mb-4 text-lg font-extrabold uppercase tracking-wide text-ink-900';

export function FnbMenuPage(): ReactElement {
   const [fnbFilter, setFnbFilter] = useState<FnbFilter>('ALL');
   const menuQuery: UseQueryResult<FnbMenu> = useQuery<FnbMenu>({
      queryKey: PUBLIC_FNB_KEY,
      queryFn: getPublicFnbMenu,
   });
   const bestSellerIds: FnbBestSellerIds = useFnbBestSellers();
   const fnbMenu: FnbMenu | undefined = menuQuery.data;
   const isMenuEmpty: boolean = fnbMenu !== undefined && fnbMenu.combos.length === 0 && fnbMenu.items.length === 0;

   function getItemsByCategory(fnbCategory: FnbCategory): FnbItem[] {
      return (fnbMenu?.items ?? []).filter((fnbItem) => fnbItem.category === fnbCategory);
   }

   const filterTabs: FnbFilterTab[] = [
      { filter: 'ALL', label: 'Tất cả' },
      ...((fnbMenu?.combos.length ?? 0) > 0 ? [{ filter: 'COMBO' as const, label: 'Combo tiết kiệm' }] : []),
      ...FNB_CATEGORIES.filter((fnbCategory) => getItemsByCategory(fnbCategory).length > 0).map((fnbCategory) => ({
         filter: fnbCategory,
         label: FNB_CATEGORY_LABELS[fnbCategory],
      })),
   ];
   const isComboVisible: boolean = fnbFilter === 'ALL' || fnbFilter === 'COMBO';
   const visibleCategories: FnbCategory[] = FNB_CATEGORIES.filter(
      (fnbCategory) => (fnbFilter === 'ALL' || fnbFilter === fnbCategory) && getItemsByCategory(fnbCategory).length > 0,
   );

   return (
      <>
         <section className="relative flex min-h-[160px] items-center overflow-hidden bg-[#a9e6dc] lg:min-h-[190px]">
            <img
               src={fnbBannerImageUrl}
               alt=""
               aria-hidden="true"
               className="absolute inset-0 size-full object-cover object-right"
            />
            <div className="relative mx-auto w-full max-w-6xl space-y-2 px-4 py-8 sm:px-6 lg:px-12">
               <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">Thức ăn và nước</h1>
               <p className="max-w-2xl text-sm text-ink-800">
                  Combo bắp nước và đồ ăn nhẹ được chọn kèm khi đặt vé, nhận tại quầy mà không phải xếp hàng thêm.
               </p>
            </div>
         </section>

         <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-12">
            {menuQuery.isPending && <p className="text-sm text-ink-500">Đang tải thực đơn...</p>}
            {menuQuery.isError && <Alert variant="error">{getErrorMessage(menuQuery.error)}</Alert>}
            {isMenuEmpty && (
               <p className="rounded-2xl bg-white p-10 text-center text-sm text-ink-500 shadow-md">
                  Thực đơn đang được cập nhật. Vui lòng quay lại sau.
               </p>
            )}

            {fnbMenu && !isMenuEmpty && (
               <div role="tablist" aria-label="Lọc thực đơn" className="flex flex-wrap justify-center gap-2.5">
                  {filterTabs.map((filterTab) => (
                     <button
                        key={filterTab.filter}
                        type="button"
                        role="tab"
                        aria-selected={filterTab.filter === fnbFilter}
                        onClick={() => setFnbFilter(filterTab.filter)}
                        className={cn(
                           'rounded-full border px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
                           filterTab.filter === fnbFilter
                              ? 'border-brand-700 bg-brand-600 text-white shadow-md'
                              : 'border-ink-300 bg-white text-ink-800 hover:border-brand-600 hover:text-brand-700',
                        )}
                     >
                        {filterTab.label}
                     </button>
                  ))}
               </div>
            )}

            {fnbMenu && fnbMenu.combos.length > 0 && isComboVisible && (
               <section aria-labelledby="fnb-combos-heading">
                  <h2 id="fnb-combos-heading" className={SECTION_HEADING_CLASS_NAME}>
                     Combo tiết kiệm
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                     {fnbMenu.combos.map((fnbCombo, comboIndex) => (
                        <Reveal key={fnbCombo.id} delayMs={(comboIndex % 3) * 80} className="h-full">
                           <FnbComboCard fnbCombo={fnbCombo} isBestSeller={bestSellerIds.comboIds.has(fnbCombo.id)} />
                        </Reveal>
                     ))}
                  </div>
               </section>
            )}

            {visibleCategories.map((fnbCategory) => (
               <section key={fnbCategory} aria-label={FNB_CATEGORY_LABELS[fnbCategory]}>
                  <h2 className={SECTION_HEADING_CLASS_NAME}>{FNB_CATEGORY_LABELS[fnbCategory]}</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                     {getItemsByCategory(fnbCategory).map((fnbItem, itemIndex) => (
                        <Reveal key={fnbItem.id} delayMs={(itemIndex % 3) * 80} className="h-full">
                           <FnbItemCard fnbItem={fnbItem} isBestSeller={bestSellerIds.itemIds.has(fnbItem.id)} />
                        </Reveal>
                     ))}
                  </div>
               </section>
            ))}
         </div>
      </>
   );
}

export default FnbMenuPage;
