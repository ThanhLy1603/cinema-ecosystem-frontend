import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { FnbSelectionLine, FnbSelection } from '@/types/booking/fnbSelection';

interface BookingState {
   showtimeId: number | null;
   notice: string | null;
   fnbSelection: FnbSelection | null;

   selectShowtime: (showtimeId: number) => void;
   setNotice: (notice: string | null) => void;
   setFnbSelectionLines: (showtimeId: number, fnbSelectionLines: FnbSelectionLine[]) => void;
   clearBooking: () => void;
}

export const useBookingStore: UseBoundStore<StoreApi<BookingState>> = create<BookingState>((set, get) => ({
   showtimeId: null,
   notice: null,
   fnbSelection: null,

   selectShowtime(showtimeId: number): void {
      if (get().showtimeId !== showtimeId) {
         set({ showtimeId, notice: null, fnbSelection: null });
      }
   },

   setNotice(notice: string | null): void {
      set({ notice });
   },

   setFnbSelectionLines(showtimeId: number, fnbSelectionLines: FnbSelectionLine[]): void {
      set({ fnbSelection: { showtimeId, lines: fnbSelectionLines } });
   },

   clearBooking(): void {
      set({ showtimeId: null, notice: null, fnbSelection: null });
   },
}));

export default useBookingStore;
