import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { createFacility, updateFacility } from '@/api/cinema/cinemaApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import MediaUploadField from '@/components/common/MediaUploadField';
import { createMediaFieldState, getMediaUrlToValidate } from '@/lib/media/mediaField';
import { useDeferredUpload, type DeferredUpload } from '@/lib/media/useDeferredUpload';
import type { MediaFieldState } from '@/types/media/media';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import { PUBLIC_CINEMAS_KEY } from '@/lib/cinema/cinemaQueryKeys';
import type { Facility, FacilityRequest } from '@/types/cinema/cinema';
import { ADMIN_CINEMA_LIST_KEY, ADMIN_FACILITIES_KEY } from '../utils/queryKeys';
import { emptyToNull, validateOptionalHttpsUrl, validateOptionalText, validateRequiredText } from '../utils/validation';

interface FacilityFormProps {
   facility?: Facility;
   onDone: () => void;
   onCancel: () => void;
}

interface FacilityFieldErrors {
   name?: string;
   iconUrl?: string;
   description?: string;
}

export function FacilityForm({ facility, onDone, onCancel }: FacilityFormProps): ReactElement {
   const [name, setName] = useState<string>(facility?.name ?? '');
   const [iconMedia, setIconMedia] = useState<MediaFieldState>(createMediaFieldState(facility?.iconUrl));
   const deferredUpload: DeferredUpload = useDeferredUpload();
   const [description, setDescription] = useState<string>(facility?.description ?? '');
   const [fieldErrors, setFieldErrors] = useState<FacilityFieldErrors>({});
   const queryClient: QueryClient = useQueryClient();

   function handleSaved(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_FACILITIES_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_CINEMA_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_CINEMAS_KEY });
      onDone();
   }

   const facilityMutation: UseMutationResult<Facility, unknown, FacilityRequest> = useMutation<
      Facility,
      unknown,
      FacilityRequest
   >({
      mutationFn: (facilityRequest) =>
         facility ? updateFacility(facility.id, facilityRequest) : createFacility(facilityRequest),
      onSuccess: handleSaved,
   });

   const isNameTaken: boolean =
      facilityMutation.isError && getErrorCode(facilityMutation.error) === 'FACILITY_NAME_EXISTS';

   const isBusy: boolean = facilityMutation.isPending || deferredUpload.isUploading;

   async function handleSubmit(formEvent: FormEvent<HTMLFormElement>): Promise<void> {
      formEvent.preventDefault();
      facilityMutation.reset();
      const nextFieldErrors: FacilityFieldErrors = {
         name: validateRequiredText(name, 'Vui lòng nhập tên tiện ích', 100),
         iconUrl: validateOptionalHttpsUrl(getMediaUrlToValidate(iconMedia), 500),
         description: validateOptionalText(description, 500),
      };
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.name || nextFieldErrors.iconUrl || nextFieldErrors.description) {
         return;
      }
      const resolvedUrls: string[] | null = await deferredUpload.uploadPendingFiles([
         {
            label: 'biểu tượng',
            mediaFieldState: iconMedia,
            mediaPurpose: 'FACILITY_ICON',
            onUploaded: (uploadedUrl) => setIconMedia(createMediaFieldState(uploadedUrl)),
         },
      ]);
      if (resolvedUrls === null) {
         return;
      }
      facilityMutation.mutate({
         name: name.trim(),
         iconUrl: emptyToNull(resolvedUrls[0]),
         description: emptyToNull(description),
      });
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
         noValidate
      >
         {deferredUpload.uploadError && <Alert variant="error">{deferredUpload.uploadError}</Alert>}
         {facilityMutation.isError && !isNameTaken && (
            <Alert variant="error">{getErrorMessage(facilityMutation.error)}</Alert>
         )}
         <div className="grid gap-4 sm:grid-cols-2">
            <TextField
               id={`facility-name-${facility?.id ?? 'new'}`}
               label="Tên tiện ích"
               value={name}
               onChange={setName}
               maxLength={100}
               autoFocus
               error={fieldErrors.name ?? (isNameTaken ? getErrorMessage(facilityMutation.error) : undefined)}
            />
            <MediaUploadField
               id={`facility-icon-${facility?.id ?? 'new'}`}
               label="Biểu tượng"
               value={iconMedia}
               onChange={setIconMedia}
               disabled={isBusy}
               mediaPurpose="FACILITY_ICON"
               accept="image/jpeg,image/png,image/webp,image/svg+xml"
               placeholder="https://... hoặc tải ảnh lên"
               optional
               error={fieldErrors.iconUrl}
            />
            <div className="sm:col-span-2">
               <TextField
                  id={`facility-description-${facility?.id ?? 'new'}`}
                  label="Mô tả"
                  value={description}
                  onChange={setDescription}
                  optional
                  maxLength={500}
                  error={fieldErrors.description}
               />
            </div>
         </div>
         <div className="flex flex-wrap gap-3">
            <Button type="submit" isLoading={isBusy} icon={<Save className="size-4" aria-hidden="true" />}>
               {facility ? 'Lưu tiện ích' : 'Thêm tiện ích'}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
               Hủy
            </Button>
            {deferredUpload.uploadMessage && (
               <p role="status" className="self-center text-sm font-medium text-ink-600">
                  {deferredUpload.uploadMessage}
               </p>
            )}
         </div>
      </form>
   );
}

export default FacilityForm;
