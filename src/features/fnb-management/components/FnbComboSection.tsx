import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Pencil, Plus, Search, TriangleAlert, UtensilsCrossed } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { deleteFnbCombo, restoreFnbCombo, searchAdminFnbCombos } from '@/api/fnbApi';
import Pagination from '@/components/common/Pagination';
import RestoreButton from '@/components/common/RestoreButton';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { FNB_STATUS_FILTER_OPTIONS } from '@/lib/fnb/fnbLabels';
import type { PageResponse } from '@/types/common/api';
import type { FnbCombo, FnbComboItem, FnbComboSearchParams, FnbStatus } from '@/types/fnb/fnb';
import { useFnbRefresh } from '../hooks/useFnbRefresh';
import { adminFnbComboListKey } from '../utils/queryKeys';
import FnbComboFormPanel, { type FnbComboPanelState } from './FnbComboFormPanel';
import FnbDeleteButton from './FnbDeleteButton';
import FnbStatusBadge from './FnbStatusBadge';

interface FnbComboSectionProps {
   isAdmin: boolean;
}

const PAGE_SIZE: number = 20;
const DELETED_FILTER_OPTIONS: { value: string; label: string }[] = [
   { value: '', label: 'Đang sử dụng' },
   { value: 'true', label: 'Đã xóa' },
];

function describeComboItems(fnbComboItems: FnbComboItem[]): string {
   return fnbComboItems.map((fnbComboItem) => `${fnbComboItem.quantity} × ${fnbComboItem.itemName}`).join(', ');
}

export function FnbComboSection({ isAdmin }: FnbComboSectionProps): ReactElement {
   const [keywordInput, setKeywordInput] = useState<string>('');
   const [keyword, setKeyword] = useState<string>('');
   const [status, setStatus] = useState<string>('');
   const [deleted, setDeleted] = useState<string>('');
   const [page, setPage] = useState<number>(0);
   const [panelState, setPanelState] = useState<FnbComboPanelState | null>(null);
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const refreshFnb: () => void = useFnbRefresh();
   const fnbComboSearchParams: FnbComboSearchParams = {
      keyword: keyword || undefined,
      status: (status || undefined) as FnbStatus | undefined,
      deleted: isAdmin && deleted === 'true',
      page,
      size: PAGE_SIZE,
   };
   const combosQuery: UseQueryResult<PageResponse<FnbCombo>> = useQuery<PageResponse<FnbCombo>>({
      queryKey: adminFnbComboListKey(fnbComboSearchParams),
      queryFn: () => searchAdminFnbCombos(fnbComboSearchParams),
      placeholderData: keepPreviousData,
   });

   function handleSearch(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      setKeyword(keywordInput.trim());
      setPage(0);
   }

   function changeFilter(setFilter: (value: string) => void, value: string): void {
      setFilter(value);
      setPage(0);
   }

   function handleSaved(message: string): void {
      setPanelState(null);
      setSuccessMessage(message);
      refreshFnb();
   }

   function handleChanged(): void {
      setSuccessMessage(null);
      refreshFnb();
   }

   function handleClosePanel(): void {
      setPanelState(null);
   }

   function openCreatePanel(): void {
      setSuccessMessage(null);
      setPanelState({ mode: 'create' });
   }

   function openEditPanel(fnbCombo: FnbCombo): void {
      setSuccessMessage(null);
      setPanelState({ mode: 'edit', fnbCombo });
   }

   const fnbCombos: FnbCombo[] = combosQuery.data?.content ?? [];

   return (
      <div className="space-y-4">
         <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-card ring-1 ring-ink-200/80"
         >
            <div className="min-w-[220px] flex-1">
               <TextField
                  id="fnb-combo-keyword"
                  label="Tìm combo"
                  value={keywordInput}
                  onChange={setKeywordInput}
                  icon={Search}
                  placeholder="Tên combo"
               />
            </div>
            <div className="w-44">
               <SelectField
                  id="fnb-combo-status-filter"
                  label="Trạng thái"
                  value={status}
                  onChange={(nextStatus) => changeFilter(setStatus, nextStatus)}
                  options={FNB_STATUS_FILTER_OPTIONS}
                  placeholder="Mọi trạng thái"
               />
            </div>
            {isAdmin && (
               <div className="w-44">
                  <SelectField
                     id="fnb-combo-deleted-filter"
                     label="Hiển thị"
                     value={deleted}
                     onChange={(nextDeleted) => changeFilter(setDeleted, nextDeleted)}
                     options={DELETED_FILTER_OPTIONS}
                     placeholder="Đang sử dụng"
                  />
               </div>
            )}
            <Button type="submit" icon={<Search className="size-4" aria-hidden="true" />}>
               Tìm
            </Button>
            <Button variant="secondary" onClick={openCreatePanel} icon={<Plus className="size-4" aria-hidden="true" />}>
               Thêm combo
            </Button>
         </form>

         {successMessage && <Alert variant="success">{successMessage}</Alert>}
         {combosQuery.isError && <Alert variant="error">{getErrorMessage(combosQuery.error)}</Alert>}
         {combosQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách combo...</p>}

         {combosQuery.data && fnbCombos.length === 0 && (
            <p className="rounded-lg bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-200/80">
               Chưa có combo nào phù hợp. Hãy tạo món lẻ trước rồi ghép thành combo.
            </p>
         )}

         {fnbCombos.length > 0 && (
            <div className="overflow-x-auto rounded-lg bg-white shadow-card ring-1 ring-ink-200/80">
               <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-b border-ink-100 bg-ink-50/80 text-[11px] uppercase tracking-wider text-ink-500">
                     <tr>
                        <th className="px-4 py-2.5 font-semibold">Combo</th>
                        <th className="px-4 py-2.5 font-semibold">Thành phần</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Giá</th>
                        <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
                        <th className="px-4 py-2.5" />
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                     {fnbCombos.map((fnbCombo) => (
                        <tr key={fnbCombo.id} className="align-middle hover:bg-ink-50/60">
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                 {fnbCombo.imageUrl ? (
                                    <img
                                       src={fnbCombo.imageUrl}
                                       alt=""
                                       className="size-11 shrink-0 rounded-md object-cover"
                                    />
                                 ) : (
                                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-300">
                                       <UtensilsCrossed className="size-5" aria-hidden="true" />
                                    </span>
                                 )}
                                 <p className="font-semibold text-ink-900">{fnbCombo.name}</p>
                              </div>
                           </td>
                           <td className="max-w-[280px] px-4 py-3 text-[13px] text-ink-600">
                              {describeComboItems(fnbCombo.items)}
                           </td>
                           <td className="whitespace-nowrap px-4 py-3 text-right">
                              <p className="font-semibold text-ink-900">{formatVnd(fnbCombo.price)}</p>
                              <p className="text-xs text-ink-500">Mua lẻ {formatVnd(fnbCombo.itemsTotalPrice)}</p>
                           </td>
                           <td className="px-4 py-3">
                              <div className="space-y-1">
                                 <FnbStatusBadge fnbStatus={fnbCombo.status} isDeleted={fnbCombo.deleted} />
                                 {!fnbCombo.deleted && fnbCombo.status === 'AVAILABLE' && !fnbCombo.orderable && (
                                    <p className="flex items-center gap-1 text-xs font-medium text-amber-700">
                                       <TriangleAlert className="size-3.5" aria-hidden="true" />
                                       Có món hết hàng, chưa bán được
                                    </p>
                                 )}
                              </div>
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-start justify-end gap-2">
                                 {fnbCombo.deleted ? (
                                    <RestoreButton
                                       restore={() => restoreFnbCombo(fnbCombo.id)}
                                       onRestored={handleChanged}
                                    />
                                 ) : (
                                    <>
                                       <Button
                                          variant="secondary"
                                          size="sm"
                                          icon={<Pencil className="size-3.5" aria-hidden="true" />}
                                          onClick={() => openEditPanel(fnbCombo)}
                                       >
                                          Sửa
                                       </Button>
                                       {isAdmin && (
                                          <FnbDeleteButton
                                             confirmMessage="Xóa combo này? Có thể khôi phục lại sau."
                                             remove={() => deleteFnbCombo(fnbCombo.id)}
                                             onDeleted={handleChanged}
                                          />
                                       )}
                                    </>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {combosQuery.data && (
            <Pagination
               page={combosQuery.data.page}
               totalPages={combosQuery.data.totalPages}
               totalElements={combosQuery.data.totalElements}
               onPageChange={setPage}
            />
         )}

         {panelState && (
            <FnbComboFormPanel
               key={panelState.mode === 'edit' ? `edit-${panelState.fnbCombo.id}` : 'create'}
               panelState={panelState}
               onSaved={handleSaved}
               onClose={handleClosePanel}
            />
         )}
      </div>
   );
}

export default FnbComboSection;
