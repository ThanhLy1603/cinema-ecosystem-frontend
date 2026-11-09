import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import SectionCard from '@/components/common/SectionCard';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import SelectField from '@/components/ui/SelectField';
import { getErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Facility } from '@/types/cinema';
import { DELETED_FILTER_OPTIONS } from '../utils/labels';
import FacilityForm from '../components/FacilityForm';
import FacilityRow from '../components/FacilityRow';
import { useFacilities } from '../hooks/useFacilities';

export function FacilityManagementPage(): ReactElement {
   const isAdmin: boolean = useAuthStore((authState) => authState.hasRole('ROLE_ADMIN'));
   const [isShowingDeleted, setIsShowingDeleted] = useState<boolean>(false);
   const facilitiesQuery: UseQueryResult<Facility[]> = useFacilities(isShowingDeleted);
   const [editingFacilityId, setEditingFacilityId] = useState<number | null>(null);
   const [isCreating, setIsCreating] = useState<boolean>(false);

   function closeForms(): void {
      setEditingFacilityId(null);
      setIsCreating(false);
   }

   function startEditing(facilityId: number): void {
      setIsCreating(false);
      setEditingFacilityId(facilityId);
   }

   function startCreating(): void {
      setEditingFacilityId(null);
      setIsCreating(true);
   }

   return (
      <div className="w-full max-w-3xl space-y-6">
         <Link to="/admin/cinemas" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Về danh sách cụm rạp
         </Link>
         <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">Danh mục tiện ích</h1>
         <SectionCard
            title="Tiện ích của rạp"
            description={
               isAdmin
                  ? 'Bãi đỗ xe, phòng VIP, khu vui chơi... Gán tiện ích cho từng cụm rạp ở trang chi tiết.'
                  : 'Chỉ quản trị viên mới được thêm, sửa hoặc xóa tiện ích.'
            }
         >
            <div className="space-y-4">
               {isAdmin && (
                  <div className="max-w-xs">
                     <SelectField
                        id="facility-deleted-filter"
                        label="Hiển thị"
                        value={isShowingDeleted ? 'true' : ''}
                        onChange={(deleted) => setIsShowingDeleted(deleted === 'true')}
                        options={DELETED_FILTER_OPTIONS}
                        placeholder="Đang sử dụng"
                     />
                  </div>
               )}
               {facilitiesQuery.isError && <Alert variant="error">{getErrorMessage(facilitiesQuery.error)}</Alert>}
               {facilitiesQuery.isPending && <p className="text-sm text-ink-500">Đang tải danh mục...</p>}
               <ul className="space-y-3">
                  {facilitiesQuery.data?.map((facility) =>
                     editingFacilityId === facility.id ? (
                        <li key={facility.id}>
                           <FacilityForm facility={facility} onDone={closeForms} onCancel={closeForms} />
                        </li>
                     ) : (
                        <FacilityRow key={facility.id} facility={facility} canManage={isAdmin} onEdit={startEditing} />
                     ),
                  )}
               </ul>
               {facilitiesQuery.data?.length === 0 && (
                  <p className="rounded-2xl bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
                     Danh mục tiện ích đang trống.
                  </p>
               )}
               {isAdmin &&
                  !isShowingDeleted &&
                  (isCreating ? (
                     <FacilityForm onDone={closeForms} onCancel={closeForms} />
                  ) : (
                     <Button
                        variant="secondary"
                        icon={<Plus className="size-4" aria-hidden="true" />}
                        onClick={startCreating}
                     >
                        Thêm tiện ích
                     </Button>
                  ))}
            </div>
         </SectionCard>
      </div>
   );
}

export default FacilityManagementPage;
