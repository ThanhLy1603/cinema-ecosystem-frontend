import { create } from 'zustand'

export interface SelectedSeat {
   id: number
   seatCode: string
   seatType: 'STANDARD' | 'VIP' | 'COUPLE'
   price: number
}

interface BookingState {
   showtimeId: number | null
   movieTitle: string | null
   cinemaName: string | null
   hallName: string | null
   selectedSeats: SelectedSeat[]
   holdExpiresAt: number | null // Timestamp ms

   // Actions
   setShowtimeInfo: (info: {
      showtimeId: number
      movieTitle: string
      cinemaName: string
      hallName: string
   }) => void
   toggleSeat: (seat: SelectedSeat) => void
   setHoldExpiresAt: (timestamp: number | null) => void
   clearBooking: () => void
   getTotalAmount: () => number
}

export const useBookingStore = create<BookingState>((set, get) => ({
   showtimeId: null,
   movieTitle: null,
   cinemaName: null,
   hallName: null,
   selectedSeats: [],
   holdExpiresAt: null,

   setShowtimeInfo: (info) => set({ ...info }),

   toggleSeat: (seat) => {
      const { selectedSeats } = get()
      const exists = selectedSeats.some((s) => s.id === seat.id)
      if (exists) {
         set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) })
      } else {
         set({ selectedSeats: [...selectedSeats, seat] })
      }
   },

   setHoldExpiresAt: (timestamp) => set({ holdExpiresAt: timestamp }),

   clearBooking: () =>
      set({
         showtimeId: null,
         movieTitle: null,
         cinemaName: null,
         hallName: null,
         selectedSeats: [],
         holdExpiresAt: null,
      }),

   getTotalAmount: () => {
      return get().selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
   },
}))

export default useBookingStore
