import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Pencil, Plus, Search, UtensilsCrossed } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { deleteFnbItem, restoreFnbItem, searchAdminFnbItems } from '@/api/fnb/fnbApi';
import Pagination from '@/components/common/Pagination';
import RestoreButton from '@/components/common/RestoreButton';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { FNB_CATEGORY_FILTER_OPTIONS, FNB_CATEGORY_LABELS, FNB_STATUS_FILTER_OPTIONS } from '@/lib/fnb/fnbLabels';
import type { PageResponse } from '@/types/common/api';
import type { FnbCategory, FnbItem, FnbItemSearchParams, FnbStatus } from '@/types/fnb/fnb';
import { useFnbRefresh } from '../hooks/useFnbRefresh';
import { adminFnbItemListKey } from '../utils/queryKeys';
import FnbDeleteButton from './FnbDeleteButton';
import FnbItemFormPanel, { type FnbItemPanelState } from './FnbItemFormPanel';
import FnbStatusBadge from './FnbStatusBadge';

interface FnbItemSectionProps {
   isAdmin: boolean;
}

const PAGE_SIZE: number = 20;
const DELETED_FILTER_OPTIONS: { value: string; label: string }[] = [
   { value: '', label: 'Đang sử dụng' },
   { value: 'true', label: 'Đã xóa' },
];

export function FnbItemSection({ isAdmin }: FnbItemSectionProps): ReactElement {
   const [keywordInput, setKeywordInput] = useState<string>('');
   const [keyword, setKeyword] = useState<string>('');
   const [category, setCategory] = useState<string>('');
   const [status, setStatus] = useState<string>('');
   const [deleted, setDeleted] = useState<string>('');
   const [page, setPage] = useState<number>(0);
   const [panelState, setPanelState] = useState<FnbItemPanelState | null>(null);
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const refreshFnb: () => void = useFnbRefresh();
   const fnbItemSearchParams: FnbItemSearchParams = {
      keyword: keyword || undefined,
      category: (category || undefined) as FnbCategory | undefined,
      status: (status || undefined) as FnbStatus | undefined,
      deleted: isAdmin && deleted === 'true',
      page,
      size: PAGE_SIZE,
   };
   const itemsQuery: UseQueryResult<PageResponse<FnbItem>> = useQuery<PageResponse<FnbItem>>({
      queryKey: adminFnbItemListKey(fnbItemSearchParams),
      queryFn: () => searchAdminFnbItems(fnbItemSearchParams),
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

   function openEditPanel(fnbItem: FnbItem): void {
      setSuccessMessage(null);
      setPanelState({ mode: 'edit', fnbItem });
   }

   const fnbItems: FnbItem[] = itemsQuery.data?.content ?? [];

   return (
      <div className="space-y-4">
         <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-card ring-1 ring-ink-200/80"
         >
            <div className="min-w-[220px] flex-1">
               <TextField
                  id="fnb-item-keyword"
                  label="Tìm món"
                  value={keywordInput}
                  onChange={setKeywordInput}
                  icon={Search}
                  placeholder="Tên món"
               />
            </div>
            <div className="w-44">
               <SelectField
                  id="fnb-item-category-filter"
                  label="Nhóm"
                  value={category}
                  onChange={(nextCategory) => changeFilter(setCategory, nextCategory)}
                  options={FNB_CATEGORY_FILTER_OPTIONS}
                  placeholder="Tất cả nhóm"
               />
            </div>
            <div className="w-44">
               <SelectField
                  id="fnb-item-status-filter"
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
                     id="fnb-item-deleted-filter"
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
               Thêm món
            </Button>
         </form>

         {successMessage && <Alert variant="success">{successMessage}</Alert>}
         {itemsQuery.isError && <Alert variant="error">{getErrorMessage(itemsQuery.error)}</Alert>}
         {itemsQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách món...</p>}

         {itemsQuery.data && fnbItems.length === 0 && (
            <p className="rounded-lg bg-white p-10 text-center text-sm text-ink-500 shadow-card ring-1 ring-ink-200/80">
               Chưa có món nào phù hợp. Bấm "Thêm món" để tạo món đầu tiên.
            </p>
         )}

         {fnbItems.length > 0 && (
            <div className="overflow-x-auto rounded-lg bg-white shadow-card ring-1 ring-ink-200/80">
               <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-ink-100 bg-ink-50/80 text-[11px] uppercase tracking-wider text-ink-500">
                     <tr>
                        <th className="px-4 py-2.5 font-semibold">Món</th>
                        <th className="px-4 py-2.5 font-semibold">Nhóm</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Giá</th>
                        <th className="px-4 py-2.5 font-semibold">Trạng thái</th>
                        <th className="px-4 py-2.5" />
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                     {fnbItems.map((fnbItem) => (
                        <tr key={fnbItem.id} className="align-middle hover:bg-ink-50/60">
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                 {fnbItem.imageUrl ? (
                                    <img
                                       src={fnbItem.imageUrl}
                                       alt=""
                                       className="size-11 shrink-0 rounded-md object-cover"
                                    />
                                 ) : (
                                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-ink-100 text-ink-300">
                                       <UtensilsCrossed className="size-5" aria-hidden="true" />
                                    </span>
                                 )}
                                 <p className="font-semibold text-ink-900">{fnbItem.name}</p>
                              </div>
                           </td>
                           <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                              {FNB_CATEGORY_LABELS[fnbItem.category]}
                           </td>
                           <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-ink-900">
                              {formatVnd(fnbItem.price)}
                           </td>
                           <td className="px-4 py-3">
                              <FnbStatusBadge fnbStatus={fnbItem.status} isDeleted={fnbItem.deleted} />
                           </td>
                           <td className="px-4 py-3">
                              <div className="flex items-start justify-end gap-2">
                                 {fnbItem.deleted ? (
                                    <RestoreButton
                                       restore={() => restoreFnbItem(fnbItem.id)}
                                       onRestored={handleChanged}
                                    />
                                 ) : (
                                    <>
                                       <Button
                                          variant="secondary"
                                          size="sm"
                                          icon={<Pencil className="size-3.5" aria-hidden="true" />}
                                          onClick={() => openEditPanel(fnbItem)}
                                       >
                                          Sửa
                                       </Button>
                                       {isAdmin && (
                                          <FnbDeleteButton
                                             confirmMessage="Xóa món này? Có thể khôi phục lại sau. Không xóa được khi món đang nằm trong combo."
                                             remove={() => deleteFnbItem(fnbItem.id)}
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

         {itemsQuery.data && (
            <Pagination
               page={itemsQuery.data.page}
               totalPages={itemsQuery.data.totalPages}
               totalElements={itemsQuery.data.totalElements}
               onPageChange={setPage}
            />
         )}

         {panelState && (
            <FnbItemFormPanel
               key={panelState.mode === 'edit' ? `edit-${panelState.fnbItem.id}` : 'create'}
               panelState={panelState}
               onSaved={handleSaved}
               onClose={handleClosePanel}
            />
         )}
      </div>
   );
}

export default FnbItemSection;
