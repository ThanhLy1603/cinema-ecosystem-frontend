import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { createFnbItem, updateFnbItem } from '@/api/fnbApi';
import MediaUploadField from '@/components/common/MediaUploadField';
import SidePanel from '@/components/common/SidePanel';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { FNB_CATEGORY_OPTIONS, FNB_STATUS_OPTIONS } from '@/lib/fnb/fnbLabels';
import { createMediaFieldState, getMediaUrlToValidate } from '@/lib/media/mediaField';
import { useDeferredUpload, type DeferredUpload } from '@/lib/media/useDeferredUpload';
import type { FnbItem, FnbItemRequest } from '@/types/fnb/fnb';
import type { MediaFieldState } from '@/types/media/media';
import {
   buildFnbItemRequest,
   getFnbServerFieldErrors,
   hasFnbFormErrors,
   validateFnbItemForm,
   type FnbItemFormErrors,
   type FnbItemFormValues,
} from '../utils/validation';

export type FnbItemPanelState = { mode: 'create' } | { mode: 'edit'; fnbItem: FnbItem };

interface FnbItemFormPanelProps {
   panelState: FnbItemPanelState;
   onSaved: (message: string) => void;
   onClose: () => void;
}

export function FnbItemFormPanel({ panelState, onSaved, onClose }: FnbItemFormPanelProps): ReactElement {
   const editingFnbItem: FnbItem | null = panelState.mode === 'edit' ? panelState.fnbItem : null;
   const [name, setName] = useState<string>(editingFnbItem?.name ?? '');
   const [category, setCategory] = useState<string>(editingFnbItem?.category ?? 'POPCORN');
   const [price, setPrice] = useState<string>(editingFnbItem ? String(editingFnbItem.price) : '');
   const [status, setStatus] = useState<string>(editingFnbItem?.status ?? 'AVAILABLE');
   const [imageMedia, setImageMedia] = useState<MediaFieldState>(createMediaFieldState(editingFnbItem?.imageUrl));
   const [fnbItemFormErrors, setFnbItemFormErrors] = useState<FnbItemFormErrors>({});
   const deferredUpload: DeferredUpload = useDeferredUpload();

   const saveMutation: UseMutationResult<FnbItem, unknown, FnbItemRequest> = useMutation<
      FnbItem,
      unknown,
      FnbItemRequest
   >({
      mutationFn: (fnbItemRequest) =>
         editingFnbItem ? updateFnbItem(editingFnbItem.id, fnbItemRequest) : createFnbItem(fnbItemRequest),
      onSuccess: () => onSaved(editingFnbItem ? 'Đã cập nhật món' : 'Đã thêm món'),
      onError: (error) => setFnbItemFormErrors(getFnbServerFieldErrors(error) as FnbItemFormErrors),
   });
   const isBusy: boolean = saveMutation.isPending || deferredUpload.isUploading;
   const hasServerFieldErrors: boolean = hasFnbFormErrors(fnbItemFormErrors);

   async function handleSubmit(formEvent: FormEvent<HTMLFormElement>): Promise<void> {
      formEvent.preventDefault();
      const fnbItemFormValues: FnbItemFormValues = {
         name,
         category,
         price,
         status,
         imageUrl: getMediaUrlToValidate(imageMedia),
      };
      const nextFnbItemFormErrors: FnbItemFormErrors = validateFnbItemForm(fnbItemFormValues);
      setFnbItemFormErrors(nextFnbItemFormErrors);
      if (hasFnbFormErrors(nextFnbItemFormErrors)) {
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
      const fnbItemRequest: FnbItemRequest | null = buildFnbItemRequest(fnbItemFormValues, resolvedUrls[0]);
      if (fnbItemRequest !== null) {
         saveMutation.mutate(fnbItemRequest);
      }
   }

   return (
      <SidePanel id="fnb-item-form" title={editingFnbItem ? 'Sửa món' : 'Thêm món'} onClose={onClose}>
         <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
               {saveMutation.isError && !hasServerFieldErrors && (
                  <Alert variant="error">{getErrorMessage(saveMutation.error)}</Alert>
               )}
               {deferredUpload.uploadError && <Alert variant="error">{deferredUpload.uploadError}</Alert>}
               <TextField
                  id="fnb-item-name"
                  label="Tên món"
                  value={name}
                  onChange={setName}
                  maxLength={150}
                  placeholder="Vd. Bắp rang bơ vị phô mai"
                  error={fnbItemFormErrors.name}
               />
               <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                     id="fnb-item-category"
                     label="Nhóm món"
                     value={category}
                     onChange={setCategory}
                     options={FNB_CATEGORY_OPTIONS}
                     error={fnbItemFormErrors.category}
                  />
                  <SelectField
                     id="fnb-item-status"
                     label="Trạng thái"
                     value={status}
                     onChange={setStatus}
                     options={FNB_STATUS_OPTIONS}
                     error={fnbItemFormErrors.status}
                  />
               </div>
               <TextField
                  id="fnb-item-price"
                  label="Giá bán (VNĐ)"
                  value={price}
                  onChange={setPrice}
                  placeholder="45000"
                  error={fnbItemFormErrors.price}
               />
               <MediaUploadField
                  id="fnb-item-image"
                  label="Ảnh món"
                  value={imageMedia}
                  onChange={setImageMedia}
                  disabled={isBusy}
                  mediaPurpose="FNB_IMAGE"
                  accept="image/jpeg,image/png,image/webp"
                  placeholder="https://... hoặc tải ảnh lên"
                  optional
                  error={fnbItemFormErrors.imageUrl}
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

export default FnbItemFormPanel;
