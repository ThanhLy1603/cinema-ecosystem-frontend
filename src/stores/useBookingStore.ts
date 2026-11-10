import { create, type StoreApi, type UseBoundStore } from 'zustand';

interface BookingState {
   showtimeId: number | null;
   notice: string | null;

   selectShowtime: (showtimeId: number) => void;
   setNotice: (notice: string | null) => void;
   clearBooking: () => void;
}

export const useBookingStore: UseBoundStore<StoreApi<BookingState>> = create<BookingState>((set, get) => ({
   showtimeId: null,
   notice: null,

   selectShowtime(showtimeId: number): void {
      if (get().showtimeId !== showtimeId) {
         set({ showtimeId, notice: null });
      }
   },

   setNotice(notice: string | null): void {
      set({ notice });
   },

   clearBooking(): void {
      set({ showtimeId: null, notice: null });
   },
}));

export default useBookingStore;
