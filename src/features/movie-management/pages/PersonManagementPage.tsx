import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useState, type FormEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { searchAdminPersons } from '@/api/movie/movieApi';
import Pagination from '@/components/common/Pagination';
import SectionCard from '@/components/common/SectionCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { PageResponse } from '@/types/common/api';
import type { Person } from '@/types/movie/movie';
import PersonForm from '../components/PersonForm';
import PersonRow from '../components/PersonRow';
import { ADMIN_PERSONS_KEY } from '../utils/queryKeys';

const PAGE_SIZE: number = 20;

export function PersonManagementPage(): ReactElement {
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const [searchText, setSearchText] = useState<string>('');
   const [keyword, setKeyword] = useState<string>('');
   const [page, setPage] = useState<number>(0);
   const [editingPersonId, setEditingPersonId] = useState<number | null>(null);
   const [isCreating, setIsCreating] = useState<boolean>(false);
   const personsQuery: UseQueryResult<PageResponse<Person>> = useQuery<PageResponse<Person>>({
      queryKey: [...ADMIN_PERSONS_KEY, keyword, page],
      queryFn: () => searchAdminPersons(keyword || undefined, page, PAGE_SIZE),
      placeholderData: keepPreviousData,
   });

   function handleSearch(formEvent: FormEvent<HTMLFormElement>): void {
      formEvent.preventDefault();
      setKeyword(searchText.trim());
      setPage(0);
   }

   function closeForms(): void {
      setEditingPersonId(null);
      setIsCreating(false);
   }

   function startEditing(personId: number): void {
      setIsCreating(false);
      setEditingPersonId(personId);
   }

   function startCreating(): void {
      setEditingPersonId(null);
      setIsCreating(true);
   }

   return (
      <div className="w-full max-w-3xl space-y-6">
         <Link to="/admin/movies" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về danh sách phim
         </Link>
         <h1 className="text-xl font-semibold tracking-tight text-ink-900">Đạo diễn & diễn viên</h1>
         <SectionCard
            title="Nghệ sĩ"
            description="Tạo nghệ sĩ tại đây rồi gán vai trò cho từng phim ở trang chỉnh sửa phim. Chỉ quản trị viên mới được xóa nghệ sĩ."
         >
            <div className="space-y-4">
               <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                     <TextField
                        id="person-search"
                        label="Tìm nghệ sĩ"
                        value={searchText}
                        onChange={setSearchText}
                        icon={Search}
                        placeholder="Nhập tên nghệ sĩ"
                     />
                  </div>
                  <Button type="submit" className="sm:w-32" icon={<Search className="size-4" aria-hidden="true" />}>
                     Tìm
                  </Button>
               </form>
               {personsQuery.isError && <Alert variant="error">{getErrorMessage(personsQuery.error)}</Alert>}
               {personsQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh sách...</p>}
               <ul className="space-y-3">
                  {personsQuery.data?.content.map((person) =>
                     editingPersonId === person.id ? (
                        <li key={person.id}>
                           <PersonForm person={person} onDone={closeForms} onCancel={closeForms} />
                        </li>
                     ) : (
                        <PersonRow key={person.id} person={person} canDelete={isAdmin} onEdit={startEditing} />
                     ),
                  )}
               </ul>
               {personsQuery.data?.content.length === 0 && (
                  <p className="rounded-2xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
                     Không tìm thấy nghệ sĩ nào.
                  </p>
               )}
               {personsQuery.data && (
                  <Pagination
                     page={personsQuery.data.page}
                     totalPages={personsQuery.data.totalPages}
                     totalElements={personsQuery.data.totalElements}
                     onPageChange={setPage}
                  />
               )}
               {isCreating ? (
                  <PersonForm onDone={closeForms} onCancel={closeForms} />
               ) : (
                  <Button
                     variant="secondary"
                     icon={<Plus className="size-4" aria-hidden="true" />}
                     onClick={startCreating}
                  >
                     Thêm nghệ sĩ
                  </Button>
               )}
            </div>
         </SectionCard>
      </div>
   );
}

export default PersonManagementPage;
