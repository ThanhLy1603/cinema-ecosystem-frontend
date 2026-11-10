import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { deletePriceRule, restorePriceRule } from '@/api/pricingApi';
import RestoreButton from '@/components/common/RestoreButton';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { PRICE_RULE_TYPE_DESCRIPTIONS, PRICE_RULE_TYPE_LABELS } from '@/lib/showtime/priceLabels';
import type { PriceRule, PriceRuleType } from '@/types/showtime/pricing';
import { describeCondition, describeValidity } from '../utils/describe';

interface PriceRuleSectionProps {
   ruleType: PriceRuleType;
   priceRules: PriceRule[];
   canManage: boolean;
   onCreate: (ruleType: PriceRuleType) => void;
   onEdit: (priceRule: PriceRule) => void;
   onChanged: () => void;
}

interface PriceRuleRowProps {
   priceRule: PriceRule;
   canManage: boolean;
   onEdit: (priceRule: PriceRule) => void;
   onChanged: () => void;
}

function PriceRuleRow({ priceRule, canManage, onEdit, onChanged }: PriceRuleRowProps): ReactElement {
   const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
   const validityLabel: string | null = describeValidity(priceRule);
   const deleteMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: () => deletePriceRule(priceRule.id),
      onSuccess: onChanged,
   });

   return (
      <li className="space-y-2 py-4 first:pt-0 last:pb-0">
         <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
               <p className="font-bold text-ink-900">{priceRule.ruleName}</p>
               <p className="text-sm text-ink-600">{describeCondition(priceRule)}</p>
               {validityLabel && <p className="text-xs text-ink-500">Áp dụng: {validityLabel}</p>}
            </div>
            <div className="flex items-center gap-3">
               <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-extrabold text-brand-700 ring-1 ring-brand-100">
                  +{formatVnd(priceRule.surchargeAmount)}
               </span>
               {canManage && priceRule.deleted && (
                  <RestoreButton restore={() => restorePriceRule(priceRule.id)} onRestored={onChanged} />
               )}
               {canManage && !priceRule.deleted && !isConfirmingDelete && (
                  <>
                     <Button
                        variant="secondary"
                        className="h-9 px-3"
                        icon={<Pencil className="size-4" aria-hidden="true" />}
                        onClick={() => onEdit(priceRule)}
                     >
                        Sửa
                     </Button>
                     <Button
                        variant="ghost"
                        className="h-9 px-3"
                        aria-label={`Xóa quy tắc ${priceRule.ruleName}`}
                        icon={<Trash2 className="size-4" aria-hidden="true" />}
                        onClick={() => setIsConfirmingDelete(true)}
                     />
                  </>
               )}
               {canManage && !priceRule.deleted && isConfirmingDelete && (
                  <>
                     <Button
                        className="h-9 px-3"
                        isLoading={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate()}
                     >
                        Xác nhận xóa
                     </Button>
                     <Button variant="ghost" className="h-9 px-3" onClick={() => setIsConfirmingDelete(false)}>
                        Hủy
                     </Button>
                  </>
               )}
            </div>
         </div>
         {deleteMutation.isError && <Alert variant="error">{getErrorMessage(deleteMutation.error)}</Alert>}
      </li>
   );
}

export function PriceRuleSection({
   ruleType,
   priceRules,
   canManage,
   onCreate,
   onEdit,
   onChanged,
}: PriceRuleSectionProps): ReactElement {
   return (
      <section className="space-y-4 rounded-lg bg-white p-5 shadow-card ring-1 ring-ink-200/80">
         <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
               <h2 className="text-[15px] font-semibold text-ink-900">
                  Phụ thu theo {PRICE_RULE_TYPE_LABELS[ruleType].toLowerCase()}
               </h2>
               <p className="mt-1 text-sm text-ink-500">{PRICE_RULE_TYPE_DESCRIPTIONS[ruleType]}</p>
            </div>
            {canManage && (
               <Button
                  variant="secondary"
                  className="h-9 px-3"
                  icon={<Plus className="size-4" aria-hidden="true" />}
                  onClick={() => onCreate(ruleType)}
               >
                  Thêm
               </Button>
            )}
         </div>
         {priceRules.length === 0 ? (
            <p className="rounded-xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
               Chưa có quy tắc nào, mục này hiện không cộng phụ thu.
            </p>
         ) : (
            <ul className="divide-y divide-ink-100">
               {priceRules.map((priceRule) => (
                  <PriceRuleRow
                     key={priceRule.id}
                     priceRule={priceRule}
                     canManage={canManage}
                     onEdit={onEdit}
                     onChanged={onChanged}
                  />
               ))}
            </ul>
         )}
      </section>
   );
}

export default PriceRuleSection;
