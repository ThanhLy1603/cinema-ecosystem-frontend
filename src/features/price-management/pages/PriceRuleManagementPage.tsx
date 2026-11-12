import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { listPriceRules } from '@/api/showtime/pricingApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import { getErrorMessage } from '@/lib/common/apiError';
import { PRICE_RULE_TYPES } from '@/lib/showtime/priceLabels';
import { useAuthStore } from '@/stores/useAuthStore';
import type { PriceRule, PriceRuleType } from '@/types/showtime/pricing';
import PriceRuleFormPanel, { type PriceRulePanelState } from '../components/PriceRuleFormPanel';
import PriceRuleSection from '../components/PriceRuleSection';
import PriceSimulator from '../components/PriceSimulator';
import SeatTypeSurchargeCard from '../components/SeatTypeSurchargeCard';
import { usePriceRuleRefresh } from '../hooks/usePriceRuleRefresh';
import { adminPriceRuleListKey } from '../utils/queryKeys';

const DELETED_FILTER_OPTIONS: SelectOption[] = [
   { value: '', label: 'Đang áp dụng' },
   { value: 'true', label: 'Đã xóa' },
];

export function PriceRuleManagementPage(): ReactElement {
   const [deletedFilter, setDeletedFilter] = useState<string>('');
   const [panelState, setPanelState] = useState<PriceRulePanelState | null>(null);
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const refreshPriceRules: () => void = usePriceRuleRefresh();
   const isShowingDeleted: boolean = isAdmin && deletedFilter === 'true';
   const priceRulesQuery: UseQueryResult<PriceRule[]> = useQuery<PriceRule[]>({
      queryKey: adminPriceRuleListKey(isShowingDeleted),
      queryFn: () => listPriceRules(isShowingDeleted),
   });
   const priceRules: PriceRule[] = priceRulesQuery.data ?? [];

   function handleCreate(ruleType: PriceRuleType): void {
      setSuccessMessage(null);
      setPanelState({ mode: 'create', ruleType });
   }

   function handleEdit(priceRule: PriceRule): void {
      setSuccessMessage(null);
      setPanelState({ mode: 'edit', priceRule });
   }

   function handleSaved(message: string): void {
      setPanelState(null);
      setSuccessMessage(message);
      refreshPriceRules();
   }

   function handleChanged(): void {
      setSuccessMessage(null);
      refreshPriceRules();
   }

   function handleClosePanel(): void {
      setPanelState(null);
   }

   return (
      <div className="w-full max-w-5xl space-y-6">
         <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
               <h1 className="text-xl font-semibold tracking-tight text-ink-900">Cấu hình giá vé</h1>
               <p className="mt-1 text-sm text-ink-500">
                  Giá vé = giá gốc của suất chiếu + phụ thu loại ghế + phụ thu khung giờ + phụ thu cuối tuần/ngày lễ +
                  phụ thu loại phòng.
               </p>
            </div>
            {isAdmin && (
               <Button onClick={() => handleCreate('TIME_SLOT')} icon={<Plus className="size-4" aria-hidden="true" />}>
                  Thêm quy tắc
               </Button>
            )}
         </header>

         {!isAdmin && (
            <Alert variant="info">
               Bạn có thể xem và tính thử giá vé. Chỉ quản trị viên mới được thay đổi quy tắc giá.
            </Alert>
         )}
         {successMessage && <Alert variant="success">{successMessage}</Alert>}
         {priceRulesQuery.isError && <Alert variant="error">{getErrorMessage(priceRulesQuery.error)}</Alert>}

         {isAdmin && (
            <div className="max-w-xs">
               <SelectField
                  id="price-rule-deleted-filter"
                  label="Trạng thái quy tắc"
                  value={deletedFilter}
                  onChange={setDeletedFilter}
                  options={DELETED_FILTER_OPTIONS}
               />
            </div>
         )}

         <PriceSimulator />
         <SeatTypeSurchargeCard />

         {priceRulesQuery.isPending && <p className="text-sm text-ink-500">Đang tải quy tắc giá...</p>}
         {priceRulesQuery.data &&
            PRICE_RULE_TYPES.map((ruleType) => (
               <PriceRuleSection
                  key={ruleType}
                  ruleType={ruleType}
                  priceRules={priceRules.filter((priceRule) => priceRule.ruleType === ruleType)}
                  canManage={isAdmin}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onChanged={handleChanged}
               />
            ))}

         {panelState && (
            <PriceRuleFormPanel
               key={panelState.mode === 'edit' ? `edit-${panelState.priceRule.id}` : `create-${panelState.ruleType}`}
               panelState={panelState}
               onSaved={handleSaved}
               onClose={handleClosePanel}
            />
         )}
      </div>
   );
}

export default PriceRuleManagementPage;
