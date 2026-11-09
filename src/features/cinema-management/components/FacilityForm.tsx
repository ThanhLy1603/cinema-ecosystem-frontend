import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { createFacility, updateFacility } from '@/api/cinemaApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage } from '@/lib/apiError';
import { PUBLIC_CINEMAS_KEY } from '@/lib/cinemaQueryKeys';
import type { Facility, FacilityRequest } from '@/types/cinema';
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
   const [iconUrl, setIconUrl] = useState<string>(facility?.iconUrl ?? '');
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

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      facilityMutation.reset();
      const nextFieldErrors: FacilityFieldErrors = {
         name: validateRequiredText(name, 'Vui lòng nhập tên tiện ích', 100),
         iconUrl: validateOptionalHttpsUrl(iconUrl, 500),
         description: validateOptionalText(description, 500),
      };
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.name || nextFieldErrors.iconUrl || nextFieldErrors.description) {
         return;
      }
      facilityMutation.mutate({
         name: name.trim(),
         iconUrl: emptyToNull(iconUrl),
         description: emptyToNull(description),
      });
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
         noValidate
      >
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
            <TextField
               id={`facility-icon-${facility?.id ?? 'new'}`}
               label="Đường dẫn biểu tượng"
               value={iconUrl}
               onChange={setIconUrl}
               optional
               placeholder="https://..."
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
            <Button
               type="submit"
               isLoading={facilityMutation.isPending}
               icon={<Save className="size-4" aria-hidden="true" />}
            >
               {facility ? 'Lưu tiện ích' : 'Thêm tiện ích'}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
               Hủy
            </Button>
         </div>
      </form>
   );
}

export default FacilityForm;
