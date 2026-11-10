import { Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import Button from '@/components/ui/Button';
import SelectField, { type SelectOption } from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { AGE_RATING_FILTER_OPTIONS } from '@/lib/movie/movieLabels';
import type { Genre } from '@/types/movie/movie';

interface QuickSearchBarProps {
   genres: Genre[];
}

export function QuickSearchBar({ genres }: QuickSearchBarProps): ReactElement {
   const [keyword, setKeyword] = useState<string>('');
   const [genreId, setGenreId] = useState<string>('');
   const [rated, setRated] = useState<string>('');
   const navigate: NavigateFunction = useNavigate();
   const genreOptions: SelectOption[] = [
      { value: '', label: 'Tất cả thể loại' },
      ...genres.map((genre) => ({ value: String(genre.id), label: genre.name })),
   ];

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      const urlSearchParams: URLSearchParams = new URLSearchParams();
      if (keyword.trim()) {
         urlSearchParams.set('keyword', keyword.trim());
      }
      if (genreId) {
         urlSearchParams.set('genreId', genreId);
      }
      if (rated) {
         urlSearchParams.set('rated', rated);
      }
      const queryString: string = urlSearchParams.toString();
      navigate(queryString ? `/movies?${queryString}` : '/movies');
   }

   return (
      <form
         onSubmit={handleSubmit}
         aria-label="Tìm phim nhanh"
         className="relative z-10 mx-auto -mt-12 max-w-6xl rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink-100 sm:p-5"
      >
         <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
            <TextField
               id="home-quick-keyword"
               label="Tìm phim"
               value={keyword}
               onChange={setKeyword}
               icon={Search}
               placeholder="Tên phim hoặc diễn viên"
            />
            <SelectField
               id="home-quick-genre"
               label="Thể loại"
               value={genreId}
               onChange={setGenreId}
               options={genreOptions}
               placeholder="Tất cả thể loại"
            />
            <SelectField
               id="home-quick-rated"
               label="Độ tuổi"
               value={rated}
               onChange={setRated}
               options={AGE_RATING_FILTER_OPTIONS}
               placeholder="Mọi độ tuổi"
            />
            <Button type="submit" size="lg" className="w-full md:w-auto" icon={<Search className="size-4" />}>
               Tìm phim
            </Button>
         </div>
      </form>
   );
}

export default QuickSearchBar;
