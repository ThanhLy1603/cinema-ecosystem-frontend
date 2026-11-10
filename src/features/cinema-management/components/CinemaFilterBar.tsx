import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
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
      <form
         onSubmit={handleSubmit}
         className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-card ring-1 ring-ink-200/80"
      >
         <div className="min-w-[240px] flex-1">
            <TextField
               id="cinema-search"
               label="Tìm kiếm"
               value={searchText}
               onChange={setSearchText}
               icon={Search}
               placeholder="Tên rạp hoặc địa chỉ"
            />
         </div>
         <div className="w-44">
            <SelectField
               id="cinema-city-filter"
               label="Tỉnh/Thành phố"
               value={cinemaFilters.city}
               onChange={(city) => onChange({ ...cinemaFilters, city })}
               options={buildCityFilterOptions()}
            />
         </div>
         <div className="w-44">
            <SelectField
               id="cinema-status-filter"
               label="Trạng thái"
               value={cinemaFilters.status}
               onChange={(status) => onChange({ ...cinemaFilters, status })}
               options={CINEMA_STATUS_FILTER_OPTIONS}
            />
         </div>
         {isAdmin && (
            <div className="w-44">
               <SelectField
                  id="cinema-deleted-filter"
                  label="Hiển thị"
                  value={cinemaFilters.deleted}
                  onChange={(deleted) => onChange({ ...cinemaFilters, deleted })}
                  options={DELETED_FILTER_OPTIONS}
                  placeholder="Đang sử dụng"
               />
            </div>
         )}

         <Button type="submit" icon={<Search className="size-4" aria-hidden="true" />}>
            Tìm
         </Button>
      </form>
   );
}

export default CinemaFilterBar;
