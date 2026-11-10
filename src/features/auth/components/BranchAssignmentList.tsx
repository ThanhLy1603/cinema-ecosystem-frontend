import { MapPin } from 'lucide-react';
import type { ReactElement } from 'react';
import type { BranchAssignment } from '@/types/auth/auth';

interface BranchAssignmentListProps {
   branchAssignments: BranchAssignment[];
}

export function BranchAssignmentList({ branchAssignments }: BranchAssignmentListProps): ReactElement {
   return (
      <ul className="space-y-3">
         {branchAssignments.map((branchAssignment) => (
            <li
               key={branchAssignment.cinemaId}
               className="flex items-center gap-3 rounded-2xl bg-ink-50 px-4 py-3 text-sm text-ink-900"
            >
               <MapPin className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
               <span className="min-w-0 flex-1 truncate font-semibold">
                  {branchAssignment.cinemaName ?? `Chi nhánh #${branchAssignment.cinemaId}`}
               </span>
               {branchAssignment.primary && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                     Chi nhánh chính
                  </span>
               )}
            </li>
         ))}
      </ul>
   );
}

export default BranchAssignmentList;
