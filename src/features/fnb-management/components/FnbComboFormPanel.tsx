import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { createFnbCombo, listFnbItemOptions, updateFnbCombo } from '@/api/fnb/fnbApi';
import MediaUploadField from '@/components/common/MediaUploadField';
import SidePanel from '@/components/common/SidePanel';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextAreaField from '@/components/ui/TextAreaField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { parseValidMoneyInput } from '@/lib/common/moneyInput';
import { FNB_STATUS_OPTIONS } from '@/lib/fnb/fnbLabels';
import { createMediaFieldState, getMediaUrlToValidate } from '@/lib/media/mediaField';
import { useDeferredUpload, type DeferredUpload } from '@/lib/media/useDeferredUpload';
import type { FnbCombo, FnbComboRequest, FnbItem } from '@/types/fnb/fnb';
import type { MediaFieldState } from '@/types/media/media';
import { ADMIN_FNB_ITEM_OPTIONS_KEY } from '../utils/queryKeys';
import {
   buildFnbComboRequest,
   createComboLineKey,
   getFnbServerFieldErrors,
   hasFnbFormErrors,
   validateFnbComboForm,
   type ComboLineDraft,
   type FnbComboFormErrors,
   type FnbComboFormValues,
} from '../utils/validation';
import ComboLinesEditor from './ComboLinesEditor';

export type FnbComboPanelState = { mode: 'create' } | { mode: 'edit'; fnbCombo: FnbCombo };

interface FnbComboFormPanelProps {
   panelState: FnbComboPanelState;
   onSaved: (message: string) => void;
   onClose: () => void;
}

export function FnbComboFormPanel({ panelState, onSaved, onClose }: FnbComboFormPanelProps): ReactElement {
   const editingFnbCombo: FnbCombo | null = panelState.mode === 'edit' ? panelState.fnbCombo : null;
   const [name, setName] = useState<string>(editingFnbCombo?.name ?? '');
   const [description, setDescription] = useState<string>(editingFnbCombo?.description ?? '');
   const [price, setPrice] = useState<string>(editingFnbCombo ? String(editingFnbCombo.price) : '');
   const [status, setStatus] = useState<string>(editingFnbCombo?.status ?? 'AVAILABLE');
   const [imageMedia, setImageMedia] = useState<MediaFieldState>(createMediaFieldState(editingFnbCombo?.imageUrl));
   const [comboLineDrafts, setComboLineDrafts] = useState<ComboLineDraft[]>(() =>
      (editingFnbCombo?.items ?? []).map((fnbComboItem) => ({
         key: createComboLineKey(),
         itemId: String(fnbComboItem.itemId),
         quantity: String(fnbComboItem.quantity),
      })),
   );
   const [fnbComboFormErrors, setFnbComboFormErrors] = useState<FnbComboFormErrors>({});
   const deferredUpload: DeferredUpload = useDeferredUpload();
   const itemOptionsQuery: UseQueryResult<FnbItem[]> = useQuery<FnbItem[]>({
      queryKey: ADMIN_FNB_ITEM_OPTIONS_KEY,
      queryFn: listFnbItemOptions,
   });

   const saveMutation: UseMutationResult<FnbCombo, unknown, FnbComboRequest> = useMutation<
      FnbCombo,
      unknown,
      FnbComboRequest
   >({
      mutationFn: (fnbComboRequest) =>
         editingFnbCombo ? updateFnbCombo(editingFnbCombo.id, fnbComboRequest) : createFnbCombo(fnbComboRequest),
      onSuccess: () => onSaved(editingFnbCombo ? 'Đã cập nhật combo' : 'Đã thêm combo'),
      onError: (error) => setFnbComboFormErrors(getFnbServerFieldErrors(error) as FnbComboFormErrors),
   });
   const isBusy: boolean = saveMutation.isPending || deferredUpload.isUploading;
   const hasServerFieldErrors: boolean = hasFnbFormErrors(fnbComboFormErrors);

   function handleAddLine(): void {
      setComboLineDrafts([...comboLineDrafts, { key: createComboLineKey(), itemId: '', quantity: '1' }]);
   }

   async function handleSubmit(formEvent: FormEvent<HTMLFormElement>): Promise<void> {
      formEvent.preventDefault();
      const fnbComboFormValues: FnbComboFormValues = {
         name,
         description,
         price,
         status,
         imageUrl: getMediaUrlToValidate(imageMedia),
         lines: comboLineDrafts,
      };
      const nextFnbComboFormErrors: FnbComboFormErrors = validateFnbComboForm(fnbComboFormValues);
      setFnbComboFormErrors(nextFnbComboFormErrors);
      if (hasFnbFormErrors(nextFnbComboFormErrors)) {
         return;
      }
      const resolvedUrls: string[] | null = await deferredUpload.uploadPendingFiles([
         {
            label: 'ảnh',
            mediaFieldState: imageMedia,
            mediaPurpose: 'FNB_IMAGE',
            onUploaded: (uploadedUrl) => setImageMedia(createMediaFieldState(uploadedUrl)),
         },
      ]);
      if (resolvedUrls === null) {
         return;
      }
      const fnbComboRequest: FnbComboRequest | null = buildFnbComboRequest(fnbComboFormValues, resolvedUrls[0]);
      if (fnbComboRequest !== null) {
         saveMutation.mutate(fnbComboRequest);
      }
   }

   return (
      <SidePanel
         id="fnb-combo-form"
         title={editingFnbCombo ? 'Sửa combo' : 'Thêm combo'}
         onClose={onClose}
         widthClassName="max-w-xl"
      >
         <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
               {saveMutation.isError && !hasServerFieldErrors && (
                  <Alert variant="error">{getErrorMessage(saveMutation.error)}</Alert>
               )}
               {deferredUpload.uploadError && <Alert variant="error">{deferredUpload.uploadError}</Alert>}
               {itemOptionsQuery.isError && <Alert variant="error">{getErrorMessage(itemOptionsQuery.error)}</Alert>}
               <TextField
                  id="fnb-combo-name"
                  label="Tên combo"
                  value={name}
                  onChange={setName}
                  maxLength={150}
                  placeholder="Vd. Combo đôi"
                  error={fnbComboFormErrors.name}
               />
               <TextAreaField
                  id="fnb-combo-description"
                  label="Mô tả"
                  value={description}
                  onChange={setDescription}
                  maxLength={2000}
                  optional
                  error={fnbComboFormErrors.description}
               />
               <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                     id="fnb-combo-price"
                     label="Giá combo (VNĐ)"
                     value={price}
                     onChange={setPrice}
                     placeholder="99000"
                     error={fnbComboFormErrors.price}
                  />
                  <SelectField
                     id="fnb-combo-status"
                     label="Trạng thái"
                     value={status}
                     onChange={setStatus}
                     options={FNB_STATUS_OPTIONS}
                     error={fnbComboFormErrors.status}
                  />
               </div>
               <ComboLinesEditor
                  comboLineDrafts={comboLineDrafts}
                  fnbItems={itemOptionsQuery.data ?? []}
                  comboPrice={parseValidMoneyInput(price)}
                  error={fnbComboFormErrors.items}
                  onChange={setComboLineDrafts}
                  onAddLine={handleAddLine}
               />
               <MediaUploadField
                  id="fnb-combo-image"
                  label="Ảnh combo"
                  value={imageMedia}
                  onChange={setImageMedia}
                  disabled={isBusy}
                  mediaPurpose="FNB_IMAGE"
                  accept="image/jpeg,image/png,image/webp"
                  placeholder="https://... hoặc tải ảnh lên"
                  optional
                  error={fnbComboFormErrors.imageUrl}
               />
            </div>
            <footer className="flex items-center gap-3 border-t border-ink-100 px-6 py-4">
               <Button type="submit" isLoading={isBusy} icon={<Save className="size-4" aria-hidden="true" />}>
                  Lưu
               </Button>
               <Button variant="ghost" onClick={onClose}>
                  Hủy
               </Button>
               {deferredUpload.uploadMessage && (
                  <p role="status" className="text-[13px] text-ink-600">
                     {deferredUpload.uploadMessage}
                  </p>
               )}
            </footer>
         </form>
      </SidePanel>
   );
}

export default FnbComboFormPanel;
