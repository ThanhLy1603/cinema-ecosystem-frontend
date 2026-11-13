import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getStaffContext } from '@/api/staff/staffContextApi';
import { useAuthStore } from '@/stores/useAuthStore';
import { useStaffBranchStore } from '@/stores/useStaffBranchStore';
import type { StaffBranch, StaffContext } from '@/types/staff/staffContext';
import { STAFF_CONTEXT_KEY } from './staffQueryKeys';

export interface StaffBranchSelection {
   branches: StaffBranch[];
   currentBranch: StaffBranch | null;
   allBranches: boolean;
   isLoading: boolean;
   isError: boolean;
   selectBranch: (cinemaId: number) => void;
}

function resolveCurrentBranch(branches: StaffBranch[], selectedCinemaId: number | null): StaffBranch | null {
   const selectedBranch: StaffBranch | undefined = branches.find((branch) => branch.cinemaId === selectedCinemaId);
   if (selectedBranch) {
      return selectedBranch;
   }
   return branches.find((branch) => branch.primary) ?? branches[0] ?? null;
}

export function useStaffBranch(): StaffBranchSelection {
   const isAuthenticated: boolean = useAuthStore((authState) => authState.isAuthenticated);
   const selectedCinemaId: number | null = useStaffBranchStore((branchState) => branchState.selectedCinemaId);
   const setSelectedCinemaId: (cinemaId: number | null) => void = useStaffBranchStore(
      (branchState) => branchState.setSelectedCinemaId,
   );
   const staffContextQuery: UseQueryResult<StaffContext> = useQuery<StaffContext>({
      queryKey: STAFF_CONTEXT_KEY,
      queryFn: getStaffContext,
      enabled: isAuthenticated,
   });
   const branches: StaffBranch[] = staffContextQuery.data?.branches ?? [];

   return {
      branches,
      currentBranch: resolveCurrentBranch(branches, selectedCinemaId),
      allBranches: staffContextQuery.data?.allBranches ?? false,
      isLoading: staffContextQuery.isPending,
      isError: staffContextQuery.isError,
      selectBranch(cinemaId: number): void {
         setSelectedCinemaId(cinemaId);
      },
   };
}
