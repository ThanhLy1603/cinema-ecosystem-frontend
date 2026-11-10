import { useState, type ReactElement } from 'react';
import PageHeader from '@/components/common/PageHeader';
import Alert from '@/components/ui/Alert';
import { cn } from '@/lib/common/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import FnbComboSection from '../components/FnbComboSection';
import FnbItemSection from '../components/FnbItemSection';

type FnbTab = 'ITEMS' | 'COMBOS';

interface FnbTabItem {
   tab: FnbTab;
   label: string;
}

const FNB_TAB_ITEMS: FnbTabItem[] = [
   { tab: 'ITEMS', label: 'Món lẻ' },
   { tab: 'COMBOS', label: 'Combo' },
];

export function FnbManagementPage(): ReactElement {
   const [activeTab, setActiveTab] = useState<FnbTab>('ITEMS');
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));

   return (
      <div className="w-full max-w-7xl space-y-5">
         <PageHeader
            title="Đồ ăn & nước"
            description="Danh mục món lẻ và combo bắp nước bán kèm vé. Giá áp dụng cho toàn hệ thống."
         />

         {!isAdmin && (
            <Alert variant="info">
               Bạn có thể thêm và sửa món, combo. Chỉ quản trị viên mới được xóa hoặc khôi phục.
            </Alert>
         )}

         <div role="tablist" aria-label="Danh mục đồ ăn & nước" className="flex gap-6 border-b border-ink-200">
            {FNB_TAB_ITEMS.map((fnbTabItem) => (
               <button
                  key={fnbTabItem.tab}
                  type="button"
                  role="tab"
                  aria-selected={fnbTabItem.tab === activeTab}
                  onClick={() => setActiveTab(fnbTabItem.tab)}
                  className={cn(
                     '-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors',
                     fnbTabItem.tab === activeTab
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-ink-500 hover:text-ink-900',
                  )}
               >
                  {fnbTabItem.label}
               </button>
            ))}
         </div>

         {activeTab === 'ITEMS' ? <FnbItemSection isAdmin={isAdmin} /> : <FnbComboSection isAdmin={isAdmin} />}
      </div>
   );
}

export default FnbManagementPage;
