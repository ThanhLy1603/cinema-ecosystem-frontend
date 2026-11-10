import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { AGE_RATING_FILTER_OPTIONS, MOVIE_STATUS_FILTER_OPTIONS } from '@/lib/movie/movieLabels';
import { cn } from '@/lib/common/utils';
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
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
               <TextField
                  id="admin-movie-keyword"
                  label="Tìm kiếm"
                  value={keyword}
                  onChange={setKeyword}
                  icon={Search}
                  placeholder="Tên phim, thể loại hoặc diễn viên"
               />
            </div>
            <Button type="submit" className="sm:w-40" icon={<Search className="size-4" aria-hidden="true" />}>
               Tìm
            </Button>
         </div>
         <div className={cn('grid gap-4 sm:grid-cols-2', isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
            <SelectField
               id="admin-movie-genre-filter"
               label="Thể loại"
               value={adminMovieFilters.genreId}
               onChange={(genreId) => onChange({ ...adminMovieFilters, genreId })}
               options={genreOptions}
               placeholder="Tất cả thể loại"
            />
            <SelectField
               id="admin-movie-status-filter"
               label="Trạng thái"
               value={adminMovieFilters.status}
               onChange={(status) => onChange({ ...adminMovieFilters, status })}
               options={MOVIE_STATUS_FILTER_OPTIONS}
               placeholder="Mọi trạng thái"
            />
            <SelectField
               id="admin-movie-rated-filter"
               label="Độ tuổi"
               value={adminMovieFilters.rated}
               onChange={(rated) => onChange({ ...adminMovieFilters, rated })}
               options={AGE_RATING_FILTER_OPTIONS}
               placeholder="Mọi độ tuổi"
            />
            {isAdmin && (
               <SelectField
                  id="admin-movie-deleted-filter"
                  label="Hiển thị"
                  value={adminMovieFilters.deleted}
                  onChange={(deleted) => onChange({ ...adminMovieFilters, deleted })}
                  options={DELETED_FILTER_OPTIONS}
                  placeholder="Đang sử dụng"
               />
            )}
         </div>
      </form>
   );
}

export default MovieFilterBar;
