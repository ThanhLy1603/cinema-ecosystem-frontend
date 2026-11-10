import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import SectionCard from '@/components/common/SectionCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Genre } from '@/types/movie/movie';
import GenreForm from '../components/GenreForm';
import GenreRow from '../components/GenreRow';
import { useGenres } from '../hooks/useGenres';

export function GenreManagementPage(): ReactElement {
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const genresQuery: UseQueryResult<Genre[]> = useGenres();
   const [editingGenreId, setEditingGenreId] = useState<number | null>(null);
   const [isCreating, setIsCreating] = useState<boolean>(false);

   function closeForms(): void {
      setEditingGenreId(null);
      setIsCreating(false);
   }

   function startEditing(genreId: number): void {
      setIsCreating(false);
      setEditingGenreId(genreId);
   }

   function startCreating(): void {
      setEditingGenreId(null);
      setIsCreating(true);
   }

   return (
      <div className="w-full max-w-3xl space-y-6">
         <Link to="/admin/movies" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về danh sách phim
         </Link>
         <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Danh mục thể loại</h1>
         <SectionCard
            title="Thể loại phim"
            description="Hành động, kinh dị, hoạt hình... Gán thể loại cho từng phim ở trang chỉnh sửa phim. Chỉ quản trị viên mới được xóa thể loại."
         >
            <div className="space-y-4">
               {genresQuery.isError && <Alert variant="error">{getErrorMessage(genresQuery.error)}</Alert>}
               {genresQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh mục...</p>}
               <ul className="space-y-3">
                  {genresQuery.data?.map((genre) =>
                     editingGenreId === genre.id ? (
                        <li key={genre.id}>
                           <GenreForm genre={genre} onDone={closeForms} onCancel={closeForms} />
                        </li>
                     ) : (
                        <GenreRow key={genre.id} genre={genre} canDelete={isAdmin} onEdit={startEditing} />
                     ),
                  )}
               </ul>
               {genresQuery.data?.length === 0 && (
                  <p className="rounded-2xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
                     Danh mục thể loại đang trống.
                  </p>
               )}
               {isCreating ? (
                  <GenreForm onDone={closeForms} onCancel={closeForms} />
               ) : (
                  <Button
                     variant="secondary"
                     icon={<Plus className="size-4" aria-hidden="true" />}
                     onClick={startCreating}
                  >
                     Thêm thể loại
                  </Button>
               )}
            </div>
         </SectionCard>
      </div>
   );
}

export default GenreManagementPage;
