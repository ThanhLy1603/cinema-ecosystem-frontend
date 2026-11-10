import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import type { CinemaOption } from '@/types/cinema/cinema';
import { ROLE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../utils/labels';

export interface UserFilters {
   search: string;
   role: string;
   status: string;
   cinemaId: string;
}

interface UserFilterBarProps {
   userFilters: UserFilters;
   isAdmin: boolean;
   cinemaOptions: CinemaOption[];
   onChange: (userFilters: UserFilters) => void;
}

export function UserFilterBar({ userFilters, isAdmin, cinemaOptions, onChange }: UserFilterBarProps): ReactElement {
   const [searchText, setSearchText] = useState<string>(userFilters.search);
   const cinemaFilterOptions: SelectOption[] = [
      { value: '', label: 'Mọi chi nhánh' },
      ...cinemaOptions.map((cinemaOption) => ({ value: String(cinemaOption.id), label: cinemaOption.name })),
   ];

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      onChange({ ...userFilters, search: searchText.trim() });
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-card ring-1 ring-ink-200/80"
      >
         <div className="min-w-[240px] flex-1">
            <TextField
               id="user-search"
               label="Tìm kiếm"
               value={searchText}
               onChange={setSearchText}
               icon={Search}
               placeholder="Tên, email hoặc số điện thoại"
            />
         </div>
         {isAdmin && (
            <div className="w-44">
               <SelectField
                  id="user-role-filter"
                  label="Role"
                  value={userFilters.role}
                  onChange={(role) => onChange({ ...userFilters, role })}
                  options={ROLE_FILTER_OPTIONS}
               />
            </div>
         )}
         <div className="w-44">
            <SelectField
               id="user-status-filter"
               label="Trạng thái"
               value={userFilters.status}
               onChange={(status) => onChange({ ...userFilters, status })}
               options={STATUS_FILTER_OPTIONS}
            />
         </div>
         <div className="w-44">
            <SelectField
               id="user-cinema-filter"
               label="Chi nhánh"
               value={userFilters.cinemaId}
               onChange={(cinemaId) => onChange({ ...userFilters, cinemaId })}
               options={cinemaFilterOptions}
            />
         </div>

         <Button type="submit" icon={<Search className="size-4" aria-hidden="true" />}>
            Tìm
         </Button>
      </form>
   );
}

export default UserFilterBar;
