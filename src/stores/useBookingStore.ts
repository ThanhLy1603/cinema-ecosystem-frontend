import { create, type StoreApi, type UseBoundStore } from 'zustand'

export interface SelectedSeat {
   id: number
   seatCode: string
   seatType: 'STANDARD' | 'VIP' | 'COUPLE'
   price: number
}

export interface ShowtimeInfo {
   showtimeId: number
   movieTitle: string
   cinemaName: string
   hallName: string
}

interface BookingState {
   showtimeId: number | null
   movieTitle: string | null
   cinemaName: string | null
   hallName: string | null
   selectedSeats: SelectedSeat[]
   holdExpiresAt: number | null // Timestamp ms

   // Actions
   setShowtimeInfo: (info: ShowtimeInfo) => void
   toggleSeat: (seat: SelectedSeat) => void
   setHoldExpiresAt: (timestamp: number | null) => void
   clearBooking: () => void
   getTotalAmount: () => number
}

export const useBookingStore: UseBoundStore<StoreApi<BookingState>> = create<BookingState>((set, get) => ({
   showtimeId: null,
   movieTitle: null,
   cinemaName: null,
   hallName: null,
   selectedSeats: [],
   holdExpiresAt: null,

   setShowtimeInfo(info: ShowtimeInfo): void {
      set({ ...info })
   },

   toggleSeat(seat: SelectedSeat): void {
      const { selectedSeats } = get()
      const exists: boolean = selectedSeats.some((s) => s.id === seat.id)
      if (exists) {
         set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) })
      } else {
         set({ selectedSeats: [...selectedSeats, seat] })
      }
   },

   setHoldExpiresAt(timestamp: number | null): void {
      set({ holdExpiresAt: timestamp })
   },

   clearBooking(): void {
      set({
         showtimeId: null,
         movieTitle: null,
         cinemaName: null,
         hallName: null,
         selectedSeats: [],
         holdExpiresAt: null,
      })
   },

   getTotalAmount(): number {
      return get().selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
   },
}))

export default useBookingStore
