import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { createGenre, updateGenre } from '@/api/movieApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorCode, getErrorMessage } from '@/lib/apiError';
import { validateRequiredText } from '@/lib/formValidation';
import { PUBLIC_MOVIES_KEY } from '@/lib/movieQueryKeys';
import type { Genre, GenreRequest } from '@/types/movie';
import { ADMIN_GENRES_KEY, ADMIN_MOVIE_LIST_KEY } from '../utils/queryKeys';

interface GenreFormProps {
   genre?: Genre;
   onDone: () => void;
   onCancel: () => void;
}

export function GenreForm({ genre, onDone, onCancel }: GenreFormProps): ReactElement {
   const [name, setName] = useState<string>(genre?.name ?? '');
   const [nameError, setNameError] = useState<string | undefined>(undefined);
   const queryClient: QueryClient = useQueryClient();

   function handleSaved(): void {
      void queryClient.invalidateQueries({ queryKey: ADMIN_GENRES_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_MOVIE_LIST_KEY });
      void queryClient.invalidateQueries({ queryKey: PUBLIC_MOVIES_KEY });
      onDone();
   }

   const genreMutation: UseMutationResult<Genre, unknown, GenreRequest> = useMutation<Genre, unknown, GenreRequest>({
      mutationFn: (genreRequest) => (genre ? updateGenre(genre.id, genreRequest) : createGenre(genreRequest)),
      onSuccess: handleSaved,
   });

   const isNameTaken: boolean = genreMutation.isError && getErrorCode(genreMutation.error) === 'GENRE_NAME_EXISTS';

   function handleSubmit(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      genreMutation.reset();
      const nextNameError: string | undefined = validateRequiredText(name, 'Vui lòng nhập tên thể loại', 100);
      setNameError(nextNameError);
      if (nextNameError) {
         return;
      }
      genreMutation.mutate({ name: name.trim() });
   }

   return (
      <form
         onSubmit={handleSubmit}
         className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
         noValidate
      >
         {genreMutation.isError && !isNameTaken && (
            <Alert variant="error">{getErrorMessage(genreMutation.error)}</Alert>
         )}
         <TextField
            id={`genre-name-${genre?.id ?? 'new'}`}
            label="Tên thể loại"
            value={name}
            onChange={setName}
            maxLength={100}
            autoFocus
            error={nameError ?? (isNameTaken ? getErrorMessage(genreMutation.error) : undefined)}
         />
         <div className="flex flex-wrap gap-3">
            <Button
               type="submit"
               isLoading={genreMutation.isPending}
               icon={<Save className="size-4" aria-hidden="true" />}
            >
               {genre ? 'Lưu thể loại' : 'Thêm thể loại'}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
               Hủy
            </Button>
         </div>
      </form>
   );
}

export default GenreForm;
