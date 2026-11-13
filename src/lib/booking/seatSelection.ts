import { SEAT_STATE_LABELS, type GridSeat, type SeatVisualState } from '@/lib/cinema/seatMap';
import { formatVnd } from '@/lib/common/currencyFormat';
import { getShowtimeSeatLabel } from '@/lib/booking/seatLabels';
import type { SeatAvailability, ShowtimeSeat } from '@/types/booking/seatMap';

type OccupiedVisualState = Exclude<SeatVisualState, 'available'>;

const VISUAL_STATE_BY_AVAILABILITY: Record<SeatAvailability, OccupiedVisualState | undefined> = {
   AVAILABLE: undefined,
   HELD: 'held',
   SOLD: 'sold',
   UNAVAILABLE: 'maintenance',
};

export function toGridSeat(showtimeSeat: ShowtimeSeat, isHeldByMe: boolean): GridSeat {
   const visualState: OccupiedVisualState | undefined = isHeldByMe
      ? undefined
      : VISUAL_STATE_BY_AVAILABILITY[showtimeSeat.state];
   const seatLabel: string = getShowtimeSeatLabel(showtimeSeat);
   return {
      id: showtimeSeat.id,
      row: showtimeSeat.row,
      number: showtimeSeat.number,
      type: showtimeSeat.type,
      span: showtimeSeat.span,
      status: showtimeSeat.state === 'UNAVAILABLE' ? 'MAINTENANCE' : 'ACTIVE',
      visualState,
      tooltip:
         visualState === undefined
            ? `${seatLabel} · ${formatVnd(showtimeSeat.price)}${isHeldByMe ? ' · Bạn đang giữ' : ''}`
            : `${seatLabel} · ${SEAT_STATE_LABELS[visualState]}`,
   };
}

export function formatCountdown(totalSeconds: number): string {
   const minutes: number = Math.floor(totalSeconds / 60);
   const seconds: number = totalSeconds % 60;
   return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function buildDisplayedSeatIds(
   heldSeatIds: Set<number>,
   holdingSeatId: number | null,
   releasingSeatId: number | null,
): Set<number> {
   const displayedSeatIds: Set<number> = new Set<number>(heldSeatIds);
   if (releasingSeatId !== null) {
      displayedSeatIds.delete(releasingSeatId);
   }
   if (holdingSeatId !== null) {
      displayedSeatIds.add(holdingSeatId);
   }
   return displayedSeatIds;
}
