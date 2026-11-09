import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { cn } from '@/lib/utils';
import { CINEMA_STATUS_FILTER_OPTIONS, DELETED_FILTER_OPTIONS } from '../utils/labels';
import { buildCityFilterOptions } from '../utils/provinces';

export interface CinemaFilters {
   search: string;
   city: string;
   status: string;
   deleted: string;
}

interface CinemaFilterBarProps {
   cinemaFilters: CinemaFilters;
   isAdmin: boolean;
   onChange: (cinemaFilters: CinemaFilters) => void;
}

export function CinemaFilterBar({ cinemaFilters, isAdmin, onChange }: CinemaFilterBarProps): ReactElement {
   const [searchText, setSearchText] = useState<string>(cinemaFilters.search);

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      onChange({ ...cinemaFilters, search: searchText.trim() });
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
               <TextField
                  id="cinema-search"
                  label="Tìm kiếm"
                  value={searchText}
                  onChange={setSearchText}
                  icon={Search}
                  placeholder="Tên rạp hoặc địa chỉ"
               />
            </div>
            <Button type="submit" className="sm:w-40" icon={<Search className="size-4" aria-hidden="true" />}>
               Tìm
            </Button>
         </div>
         <div className={cn('grid gap-4 sm:grid-cols-2', isAdmin && 'lg:grid-cols-3')}>
            <SelectField
               id="cinema-city-filter"
               label="Tỉnh/Thành phố"
               value={cinemaFilters.city}
               onChange={(city) => onChange({ ...cinemaFilters, city })}
               options={buildCityFilterOptions()}
            />
            <SelectField
               id="cinema-status-filter"
               label="Trạng thái"
               value={cinemaFilters.status}
               onChange={(status) => onChange({ ...cinemaFilters, status })}
               options={CINEMA_STATUS_FILTER_OPTIONS}
            />
            {isAdmin && (
               <SelectField
                  id="cinema-deleted-filter"
                  label="Hiển thị"
                  value={cinemaFilters.deleted}
                  onChange={(deleted) => onChange({ ...cinemaFilters, deleted })}
                  options={DELETED_FILTER_OPTIONS}
                  placeholder="Đang sử dụng"
               />
            )}
         </div>
      </form>
   );
}

export default CinemaFilterBar;
