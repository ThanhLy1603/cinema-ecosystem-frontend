import { addDaysToDate, todayInVietnam } from '@/lib/common/vietnamTime';
import type { OperationsFilter } from '@/types/staff/operations';

export interface OperationsFilterState {
   cinemaId: string;
   staffUserId: string;
   from: string;
   to: string;
}

export const OPERATIONS_PAGE_SIZE: number = 20;

export function createDefaultFilterState(): OperationsFilterState {
   const today: string = todayInVietnam();
   return { cinemaId: '', staffUserId: '', from: addDaysToDate(today, -6), to: today };
}

export function toOperationsFilter(operationsFilterState: OperationsFilterState, page: number): OperationsFilter {
   return {
      cinemaId: operationsFilterState.cinemaId ? Number(operationsFilterState.cinemaId) : undefined,
      staffUserId: operationsFilterState.staffUserId ? Number(operationsFilterState.staffUserId) : undefined,
      from: operationsFilterState.from || undefined,
      to: operationsFilterState.to || undefined,
      page,
      size: OPERATIONS_PAGE_SIZE,
   };
}
