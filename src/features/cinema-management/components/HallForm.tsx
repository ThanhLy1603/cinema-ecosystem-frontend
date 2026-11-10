import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { createHall, updateHall } from '@/api/hallApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import type { Hall, HallRequest, HallStatus, ScreenType } from '@/types/cinema/cinema';
import { useCinemaRefresh } from '../hooks/useCinemaRefresh';
import { HALL_STATUS_OPTIONS, SCREEN_TYPE_OPTIONS } from '../utils/labels';
import { validateRequiredSelection, validateRequiredText } from '../utils/validation';

interface HallFormProps {
   cinemaId: number;
   hall?: Hall;
   onDone: () => void;
   onCancel: () => void;
}

interface HallFieldErrors {
   name?: string;
   screenType?: string;
   status?: string;
}

export function HallForm({ cinemaId, hall, onDone, onCancel }: HallFormProps): ReactElement {
   const [name, setName] = useState<string>(hall?.name ?? '');
   const [screenType, setScreenType] = useState<string>(hall?.screenType ?? '2D');
   const [status, setStatus] = useState<string>(hall?.status ?? 'ACTIVE');
   const [fieldErrors, setFieldErrors] = useState<HallFieldErrors>({});
   const refreshCinema: () => void = useCinemaRefresh(cinemaId);

   function handleSaved(): void {
      refreshCinema();
      onDone();
   }

   const hallMutation: UseMutationResult<Hall, unknown, HallRequest> = useMutation<Hall, unknown, HallRequest>({
      mutationFn: (hallRequest) => (hall ? updateHall(hall.id, hallRequest) : createHall(cinemaId, hallRequest)),
      onSuccess: handleSaved,
   });

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      hallMutation.reset();
      const nextFieldErrors: HallFieldErrors = {
         name: validateRequiredText(name, 'Vui lòng nhập tên phòng chiếu', 100),
         screenType: validateRequiredSelection(screenType, 'Vui lòng chọn loại màn hình'),
         status: validateRequiredSelection(status, 'Vui lòng chọn trạng thái'),
      };
      setFieldErrors(nextFieldErrors);
      if (nextFieldErrors.name || nextFieldErrors.screenType || nextFieldErrors.status) {
         return;
      }
      hallMutation.mutate({
         name: name.trim(),
         screenType: screenType as ScreenType,
         status: status as HallStatus,
      });
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
         noValidate
      >
         {hallMutation.isError && <Alert variant="error">{getErrorMessage(hallMutation.error)}</Alert>}
         <div className="grid gap-4 sm:grid-cols-3">
            <TextField
               id={`hall-name-${hall?.id ?? 'new'}`}
               label="Tên phòng chiếu"
               value={name}
               onChange={setName}
               maxLength={100}
               error={fieldErrors.name}
               autoFocus
            />
            <SelectField
               id={`hall-screen-type-${hall?.id ?? 'new'}`}
               label="Loại màn hình"
               value={screenType}
               onChange={setScreenType}
               options={SCREEN_TYPE_OPTIONS}
               error={fieldErrors.screenType}
            />
            <SelectField
               id={`hall-status-${hall?.id ?? 'new'}`}
               label="Trạng thái"
               value={status}
               onChange={setStatus}
               options={HALL_STATUS_OPTIONS}
               error={fieldErrors.status}
            />
         </div>
         <div className="flex flex-wrap gap-3">
            <Button
               type="submit"
               isLoading={hallMutation.isPending}
               icon={<Save className="size-4" aria-hidden="true" />}
            >
               {hall ? 'Lưu phòng chiếu' : 'Thêm phòng chiếu'}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
               Hủy
            </Button>
         </div>
      </form>
   );
}

export default HallForm;
