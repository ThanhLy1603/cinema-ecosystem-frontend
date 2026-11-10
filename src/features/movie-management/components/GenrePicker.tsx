import type { ReactElement } from 'react';
import type { Genre } from '@/types/movie/movie';

interface GenrePickerProps {
   genres: Genre[];
   selectedGenreIds: number[];
   onChange: (selectedGenreIds: number[]) => void;
}

export function GenrePicker({ genres, selectedGenreIds, onChange }: GenrePickerProps): ReactElement {
   function toggleGenre(genreId: number): void {
      if (selectedGenreIds.includes(genreId)) {
         onChange(selectedGenreIds.filter((selectedGenreId) => selectedGenreId !== genreId));
         return;
      }
      onChange([...selectedGenreIds, genreId]);
   }

   if (genres.length === 0) {
      return <p className="text-sm text-ink-500">Chưa có thể loại nào trong danh mục.</p>;
   }

   return (
      <fieldset className="flex flex-wrap gap-2">
         <legend className="sr-only">Thể loại phim</legend>
         {genres.map((genre) => (
            <label
               key={genre.id}
               className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-800"
            >
               <input
                  type="checkbox"
                  checked={selectedGenreIds.includes(genre.id)}
                  onChange={() => toggleGenre(genre.id)}
                  className="size-4 accent-brand-600"
               />
               {genre.name}
            </label>
         ))}
      </fieldset>
   );
}

export default GenrePicker;
