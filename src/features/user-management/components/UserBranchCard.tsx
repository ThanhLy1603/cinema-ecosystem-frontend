import { useMutation, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { assignBranches } from '@/api/auth/staffApi';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/common/apiError';
import type { AdminUser } from '@/types/auth/admin';
import type { CinemaOption } from '@/types/cinema/cinema';
import type { AssignBranchesRequest, StaffResponse } from '@/types/auth/staff';
import { useAdminUserRefresh } from '../hooks/useAdminUserRefresh';
import { useCinemaOptions } from '../hooks/useCinemaOptions';
import { validateBranchSelection } from '../utils/validation';
import BranchPicker from './BranchPicker';

interface UserBranchCardProps {
   adminUser: AdminUser;
}

export function UserBranchCard({ adminUser }: UserBranchCardProps): ReactElement {
   const cinemaOptionsQuery: UseQueryResult<CinemaOption[]> = useCinemaOptions();
   const [selectedCinemaIds, setSelectedCinemaIds] = useState<number[]>(
      adminUser.branches.map((branchAssignment) => branchAssignment.cinemaId),
   );
   const [primaryCinemaId, setPrimaryCinemaId] = useState<number | null>(
      adminUser.branches.find((branchAssignment) => branchAssignment.primary)?.cinemaId ?? null,
   );
   const [selectionError, setSelectionError] = useState<string | undefined>(undefined);
   const refreshAdminUser: () => void = useAdminUserRefresh(adminUser.id);

   const assignMutation: UseMutationResult<StaffResponse, unknown, AssignBranchesRequest> = useMutation<
      StaffResponse,
      unknown,
      AssignBranchesRequest
   >({
      mutationFn: (assignBranchesRequest) => assignBranches(adminUser.id, assignBranchesRequest),
      onSuccess: refreshAdminUser,
   });

   function handleSelectionChange(nextCinemaIds: number[], nextPrimaryCinemaId: number | null): void {
      setSelectedCinemaIds(nextCinemaIds);
      setPrimaryCinemaId(nextPrimaryCinemaId);
      setSelectionError(undefined);
      assignMutation.reset();
   }

   function handleSave(): void {
      const nextSelectionError: string | undefined = validateBranchSelection(selectedCinemaIds);
      setSelectionError(nextSelectionError);
      if (nextSelectionError) {
         return;
      }
      assignMutation.mutate({ cinemaIds: selectedCinemaIds, primaryCinemaId });
   }

   return (
      <div className="space-y-5">
         {cinemaOptionsQuery.isError && <Alert variant="error">{getErrorMessage(cinemaOptionsQuery.error)}</Alert>}
         {assignMutation.isError && <Alert variant="error">{getErrorMessage(assignMutation.error)}</Alert>}
         {assignMutation.isSuccess && <Alert variant="success">Đã cập nhật chi nhánh.</Alert>}
         <BranchPicker
            cinemaOptions={cinemaOptionsQuery.data ?? []}
            selectedCinemaIds={selectedCinemaIds}
            primaryCinemaId={primaryCinemaId}
            onChange={handleSelectionChange}
            error={selectionError}
         />
         <Button
            isLoading={assignMutation.isPending}
            icon={<Save className="size-4" aria-hidden="true" />}
            onClick={handleSave}
         >
            Lưu chi nhánh
         </Button>
      </div>
   );
}

export default UserBranchCard;
