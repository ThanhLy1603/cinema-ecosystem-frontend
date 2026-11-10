import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicFnbMenu } from '@/api/fnbApi';
import PageBanner from '@/components/common/PageBanner';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { FNB_CATEGORIES, FNB_CATEGORY_LABELS } from '@/lib/fnb/fnbLabels';
import { PUBLIC_FNB_KEY } from '@/lib/fnb/fnbQueryKeys';
import type { FnbCategory, FnbItem, FnbMenu } from '@/types/fnb/fnb';
import FnbComboCard from '../components/FnbComboCard';
import FnbItemCard from '../components/FnbItemCard';

export function FnbMenuPage(): ReactElement {
   const menuQuery: UseQueryResult<FnbMenu> = useQuery<FnbMenu>({
      queryKey: PUBLIC_FNB_KEY,
      queryFn: getPublicFnbMenu,
   });
   const fnbMenu: FnbMenu | undefined = menuQuery.data;
   const isMenuEmpty: boolean = fnbMenu !== undefined && fnbMenu.combos.length === 0 && fnbMenu.items.length === 0;

   function getItemsByCategory(fnbCategory: FnbCategory): FnbItem[] {
      return (fnbMenu?.items ?? []).filter((fnbItem) => fnbItem.category === fnbCategory);
   }

   return (
      <>
         <PageBanner
            title="Thức ăn & nước"
            description="Combo bắp nước và đồ ăn nhẹ được chọn kèm khi đặt vé, nhận tại quầy mà không phải xếp hàng thêm."
         />
         <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
            {menuQuery.isPending && <p className="text-sm text-ink-500">Đang tải thực đơn...</p>}
            {menuQuery.isError && <Alert variant="error">{getErrorMessage(menuQuery.error)}</Alert>}
            {isMenuEmpty && (
               <p className="rounded-lg bg-white p-10 text-center text-sm text-ink-500 ring-1 ring-ink-200">
                  Thực đơn đang được cập nhật. Vui lòng quay lại sau.
               </p>
            )}

            {fnbMenu && fnbMenu.combos.length > 0 && (
               <section aria-labelledby="fnb-combos-heading" className="space-y-5">
                  <h2
                     id="fnb-combos-heading"
                     className="border-b border-ink-200 pb-3 text-xl font-bold uppercase tracking-tight text-ink-900"
                  >
                     Combo tiết kiệm
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                     {fnbMenu.combos.map((fnbCombo) => (
                        <FnbComboCard key={fnbCombo.id} fnbCombo={fnbCombo} />
                     ))}
                  </div>
               </section>
            )}

            {FNB_CATEGORIES.filter((fnbCategory) => getItemsByCategory(fnbCategory).length > 0).map((fnbCategory) => (
               <section key={fnbCategory} aria-label={FNB_CATEGORY_LABELS[fnbCategory]} className="space-y-5">
                  <h2 className="border-b border-ink-200 pb-3 text-xl font-bold uppercase tracking-tight text-ink-900">
                     {FNB_CATEGORY_LABELS[fnbCategory]}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                     {getItemsByCategory(fnbCategory).map((fnbItem) => (
                        <FnbItemCard key={fnbItem.id} fnbItem={fnbItem} />
                     ))}
                  </div>
               </section>
            ))}
         </div>
      </>
   );
}

export default FnbMenuPage;
