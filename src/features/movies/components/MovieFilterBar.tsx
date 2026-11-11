import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { AGE_RATING_FILTER_OPTIONS } from '@/lib/movie/movieLabels';
import type { Genre } from '@/types/movie/movie';

export interface MovieFilters {
   keyword: string;
   genreId: string;
   rated: string;
}

interface MovieFilterBarProps {
   movieFilters: MovieFilters;
   genres: Genre[];
   onChange: (movieFilters: MovieFilters) => void;
}

export function MovieFilterBar({ movieFilters, genres, onChange }: MovieFilterBarProps): ReactElement {
   const [keyword, setKeyword] = useState<string>(movieFilters.keyword);
   const genreOptions: SelectOption[] = [
      { value: '', label: 'Tất cả thể loại' },
      ...genres.map((genre) => ({ value: String(genre.id), label: genre.name })),
   ];

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      onChange({ ...movieFilters, keyword: keyword.trim() });
   }

   return (
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-xs">
         <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
               <TextField
                  id="movie-keyword"
                  label="Tìm phim"
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
         <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
               id="movie-genre-filter"
               label="Thể loại"
               value={movieFilters.genreId}
               onChange={(genreId) => onChange({ ...movieFilters, genreId })}
               options={genreOptions}
               placeholder="Tất cả thể loại"
            />
            <SelectField
               id="movie-rated-filter"
               label="Độ tuổi"
               value={movieFilters.rated}
               onChange={(rated) => onChange({ ...movieFilters, rated })}
               options={AGE_RATING_FILTER_OPTIONS}
               placeholder="Mọi độ tuổi"
            />
         </div>
      </form>
   );
}

export default MovieFilterBar;
