import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { cn } from '@/lib/common/utils';
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
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
               <TextField
                  id="user-search"
                  label="Tìm kiếm"
                  value={searchText}
                  onChange={setSearchText}
                  icon={Search}
                  placeholder="Tên, email hoặc số điện thoại"
               />
            </div>
            <Button type="submit" className="sm:w-40" icon={<Search className="size-4" aria-hidden="true" />}>
               Tìm
            </Button>
         </div>
         <div className={cn('grid gap-4 sm:grid-cols-2', isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2')}>
            {isAdmin && (
               <SelectField
                  id="user-role-filter"
                  label="Role"
                  value={userFilters.role}
                  onChange={(role) => onChange({ ...userFilters, role })}
                  options={ROLE_FILTER_OPTIONS}
               />
            )}
            <SelectField
               id="user-status-filter"
               label="Trạng thái"
               value={userFilters.status}
               onChange={(status) => onChange({ ...userFilters, status })}
               options={STATUS_FILTER_OPTIONS}
            />
            <SelectField
               id="user-cinema-filter"
               label="Chi nhánh"
               value={userFilters.cinemaId}
               onChange={(cinemaId) => onChange({ ...userFilters, cinemaId })}
               options={cinemaFilterOptions}
            />
         </div>
      </form>
   );
}

export default UserFilterBar;
