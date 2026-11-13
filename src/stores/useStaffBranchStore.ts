import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StaffBranchState {
   selectedCinemaId: number | null;
   setSelectedCinemaId: (cinemaId: number | null) => void;
}

export const useStaffBranchStore = create<StaffBranchState>()(
   persist(
      (set) => ({
         selectedCinemaId: null,
         setSelectedCinemaId(cinemaId: number | null): void {
            set({ selectedCinemaId: cinemaId });
         },
      }),
      { name: 'staff-branch' },
   ),
);
