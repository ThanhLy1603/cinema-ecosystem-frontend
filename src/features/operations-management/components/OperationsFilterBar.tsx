import type { ReactElement } from 'react';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { todayInVietnam } from '@/lib/common/vietnamTime';
import type { CinemaOption } from '@/types/cinema/cinema';
import type { OperationsFilterState } from '../utils/operationsFilters';
import { useStaffOptions } from '../hooks/useStaffOptions';

interface OperationsFilterBarProps {
   operationsFilterState: OperationsFilterState;
   cinemaOptions: CinemaOption[];
   showStaffFilter: boolean;
   onChange: (operationsFilterState: OperationsFilterState) => void;
}

export function OperationsFilterBar({
   operationsFilterState,
   cinemaOptions,
   showStaffFilter,
   onChange,
}: OperationsFilterBarProps): ReactElement {
   const staffOptions: SelectOption[] = useStaffOptions(operationsFilterState.cinemaId);
   const cinemaSelectOptions: SelectOption[] = [
      { value: '', label: 'Tất cả chi nhánh' },
      ...cinemaOptions.map((cinemaOption: CinemaOption): SelectOption => ({
         value: String(cinemaOption.id),
         label: cinemaOption.name,
      })),
   ];
   const staffSelectOptions: SelectOption[] = [{ value: '', label: 'Tất cả nhân viên' }, ...staffOptions];
   const today: string = todayInVietnam();

   return (
      <div className="grid gap-3 rounded-xl bg-white p-4 ring-1 ring-ink-100 sm:grid-cols-2 xl:grid-cols-4">
         <SelectField
            id="operations-cinema"
            label="Chi nhánh"
            value={operationsFilterState.cinemaId}
            onChange={(cinemaId: string) => onChange({ ...operationsFilterState, cinemaId, staffUserId: '' })}
            options={cinemaSelectOptions}
            optional
         />
         {showStaffFilter && (
            <SelectField
               id="operations-staff"
               label="Nhân viên"
               value={operationsFilterState.staffUserId}
               onChange={(staffUserId: string) => onChange({ ...operationsFilterState, staffUserId })}
               options={staffSelectOptions}
               optional
            />
         )}
         <TextField
            id="operations-from"
            label="Từ ngày"
            type="date"
            value={operationsFilterState.from}
            max={operationsFilterState.to || today}
            onChange={(from: string) => onChange({ ...operationsFilterState, from })}
         />
         <TextField
            id="operations-to"
            label="Đến ngày"
            type="date"
            value={operationsFilterState.to}
            max={today}
            onChange={(to: string) => onChange({ ...operationsFilterState, to })}
         />
      </div>
   );
}

export default OperationsFilterBar;
