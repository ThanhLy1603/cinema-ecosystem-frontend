import type { SeatStateChange, SeatStatusMessage, ShowtimeSeat, ShowtimeSeatMap } from '@/types/booking/seatMap';

export function parseSeatStatusMessage(messageBody: string): SeatStatusMessage | null {
   try {
      const parsedBody: unknown = JSON.parse(messageBody);
      if (typeof parsedBody !== 'object' || parsedBody === null) {
         return null;
      }
      const seatStatusMessage: SeatStatusMessage = parsedBody as SeatStatusMessage;
      if (typeof seatStatusMessage.showtimeId !== 'number' || !Array.isArray(seatStatusMessage.changes)) {
         return null;
      }
      return seatStatusMessage;
   } catch {
      return null;
   }
}

export function applySeatStatusMessage(
   showtimeSeatMap: ShowtimeSeatMap,
   seatStatusMessage: SeatStatusMessage,
): ShowtimeSeatMap {
   if (seatStatusMessage.showtimeId !== showtimeSeatMap.showtimeId) {
      return showtimeSeatMap;
   }
   const stateBySeatId: Map<number, SeatStateChange['state']> = new Map<number, SeatStateChange['state']>(
      seatStatusMessage.changes.map((seatStateChange) => [seatStateChange.seatId, seatStateChange.state]),
   );
   const nextShowtimeSeats: ShowtimeSeat[] = showtimeSeatMap.seats.map((showtimeSeat): ShowtimeSeat => {
      const nextState: SeatStateChange['state'] | undefined = stateBySeatId.get(showtimeSeat.id);
      return nextState === undefined || showtimeSeat.state === 'UNAVAILABLE'
         ? showtimeSeat
         : { ...showtimeSeat, state: nextState };
   });
   return { ...showtimeSeatMap, seats: nextShowtimeSeats };
}
