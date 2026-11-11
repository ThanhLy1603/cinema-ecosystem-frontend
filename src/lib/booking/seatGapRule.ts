import { getShowtimeSeatLabel } from '@/lib/booking/seatLabels';
import type { ShowtimeSeat } from '@/types/booking/seatMap';

function isFreeSeat(showtimeSeat: ShowtimeSeat, selectedSeatIds: Set<number>): boolean {
   return !selectedSeatIds.has(showtimeSeat.id) && showtimeSeat.state === 'AVAILABLE';
}

function isAdjacent(rowSeats: ShowtimeSeat[], firstIndex: number, secondIndex: number): boolean {
   if (secondIndex < 0 || secondIndex >= rowSeats.length) {
      return false;
   }
   const leftSeat: ShowtimeSeat = rowSeats[Math.min(firstIndex, secondIndex)];
   const rightSeat: ShowtimeSeat = rowSeats[Math.max(firstIndex, secondIndex)];
   return leftSeat.number + leftSeat.span === rightSeat.number;
}

function collectOrphan(
   rowSeats: ShowtimeSeat[],
   selectedIndex: number,
   direction: number,
   selectedSeatIds: Set<number>,
   orphanSeats: Set<ShowtimeSeat>,
): void {
   const freeIndex: number = selectedIndex + direction;
   if (!isAdjacent(rowSeats, selectedIndex, freeIndex) || !isFreeSeat(rowSeats[freeIndex], selectedSeatIds)) {
      return;
   }
   const beyondIndex: number = freeIndex + direction;
   const hasFreeNeighborBeyond: boolean =
      isAdjacent(rowSeats, freeIndex, beyondIndex) && isFreeSeat(rowSeats[beyondIndex], selectedSeatIds);
   if (!hasFreeNeighborBeyond) {
      orphanSeats.add(rowSeats[freeIndex]);
   }
}

function compareOrphanSeats(firstShowtimeSeat: ShowtimeSeat, secondShowtimeSeat: ShowtimeSeat): number {
   return (
      firstShowtimeSeat.row.localeCompare(secondShowtimeSeat.row) ||
      firstShowtimeSeat.number - secondShowtimeSeat.number
   );
}

export function findOrphanSeatLabels(showtimeSeats: ShowtimeSeat[], selectedSeatIds: Set<number>): string[] {
   if (selectedSeatIds.size === 0) {
      return [];
   }
   const seatsByRow: Map<string, ShowtimeSeat[]> = new Map<string, ShowtimeSeat[]>();
   [...showtimeSeats].sort(compareOrphanSeats).forEach((showtimeSeat) => {
      seatsByRow.set(showtimeSeat.row, [...(seatsByRow.get(showtimeSeat.row) ?? []), showtimeSeat]);
   });
   const orphanSeats: Set<ShowtimeSeat> = new Set<ShowtimeSeat>();
   seatsByRow.forEach((rowSeats: ShowtimeSeat[]): void => {
      rowSeats.forEach((showtimeSeat: ShowtimeSeat, index: number): void => {
         if (selectedSeatIds.has(showtimeSeat.id)) {
            collectOrphan(rowSeats, index, -1, selectedSeatIds, orphanSeats);
            collectOrphan(rowSeats, index, 1, selectedSeatIds, orphanSeats);
         }
      });
   });
   return [...orphanSeats].sort(compareOrphanSeats).map(getShowtimeSeatLabel);
}

export function buildOrphanSeatMessage(orphanSeatLabels: string[]): string {
   return `Vui lòng không để trống 1 ghế bên cạnh hoặc giữa các ghế bạn chọn (ghế ${orphanSeatLabels.join(', ')}).`;
}
