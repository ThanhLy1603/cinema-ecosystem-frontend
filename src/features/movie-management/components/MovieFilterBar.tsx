import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { AGE_RATING_FILTER_OPTIONS, MOVIE_STATUS_FILTER_OPTIONS } from '@/lib/movie/movieLabels';
import type { Genre } from '@/types/movie/movie';
import { DELETED_FILTER_OPTIONS } from '../utils/labels';

export interface AdminMovieFilters {
   keyword: string;
   genreId: string;
   status: string;
   rated: string;
   deleted: string;
}

interface MovieFilterBarProps {
   adminMovieFilters: AdminMovieFilters;
   genres: Genre[];
   isAdmin: boolean;
   onChange: (adminMovieFilters: AdminMovieFilters) => void;
}

export function MovieFilterBar({ adminMovieFilters, genres, isAdmin, onChange }: MovieFilterBarProps): ReactElement {
   const [keyword, setKeyword] = useState<string>(adminMovieFilters.keyword);
   const genreOptions: SelectOption[] = [
      { value: '', label: 'Tất cả thể loại' },
      ...genres.map((genre) => ({ value: String(genre.id), label: genre.name })),
   ];

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      onChange({ ...adminMovieFilters, keyword: keyword.trim() });
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow-card ring-1 ring-ink-200/80"
      >
         <div className="min-w-[240px] flex-1">
            <TextField
               id="admin-movie-keyword"
               label="Tìm kiếm"
               value={keyword}
               onChange={setKeyword}
               icon={Search}
               placeholder="Tên phim, thể loại hoặc diễn viên"
            />
         </div>
         <div className="w-44">
            <SelectField
               id="admin-movie-genre-filter"
               label="Thể loại"
               value={adminMovieFilters.genreId}
               onChange={(genreId) => onChange({ ...adminMovieFilters, genreId })}
               options={genreOptions}
               placeholder="Tất cả thể loại"
            />
         </div>
         <div className="w-44">
            <SelectField
               id="admin-movie-status-filter"
               label="Trạng thái"
               value={adminMovieFilters.status}
               onChange={(status) => onChange({ ...adminMovieFilters, status })}
               options={MOVIE_STATUS_FILTER_OPTIONS}
               placeholder="Mọi trạng thái"
            />
         </div>
         <div className="w-44">
            <SelectField
               id="admin-movie-rated-filter"
               label="Độ tuổi"
               value={adminMovieFilters.rated}
               onChange={(rated) => onChange({ ...adminMovieFilters, rated })}
               options={AGE_RATING_FILTER_OPTIONS}
               placeholder="Mọi độ tuổi"
            />
         </div>
         {isAdmin && (
            <div className="w-44">
               <SelectField
                  id="admin-movie-deleted-filter"
                  label="Hiển thị"
                  value={adminMovieFilters.deleted}
                  onChange={(deleted) => onChange({ ...adminMovieFilters, deleted })}
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

export default MovieFilterBar;
