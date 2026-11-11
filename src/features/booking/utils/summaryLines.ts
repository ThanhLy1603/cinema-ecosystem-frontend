import { compareShowtimeSeats, getShowtimeSeatLabel } from '@/lib/booking/seatLabels';
import type { FnbSelectionLine } from '@/types/booking/fnbSelection';
import type { SeatHold } from '@/types/booking/seatHold';
import type { ShowtimeSeat, ShowtimeSeatMap } from '@/types/booking/seatMap';
import type { FnbCombo, FnbItem, FnbMenu } from '@/types/fnb/fnb';
import type { SummaryFnbLine, SummarySeat } from '../components/BookingSummaryAside';

export function buildSummarySeats(
   seatHold: SeatHold | undefined,
   showtimeSeatMap: ShowtimeSeatMap | undefined,
): SummarySeat[] {
   const heldSeatIds: Set<number> = new Set<number>((seatHold?.seats ?? []).map((heldSeat) => heldSeat.seatId));
   const priceBySeatId: Map<number, number> = new Map<number, number>(
      (seatHold?.seats ?? []).map((heldSeat) => [heldSeat.seatId, heldSeat.price]),
   );
   return (showtimeSeatMap?.seats ?? [])
      .filter((showtimeSeat) => heldSeatIds.has(showtimeSeat.id))
      .sort(compareShowtimeSeats)
      .map((showtimeSeat: ShowtimeSeat) => ({
         id: showtimeSeat.id,
         label: getShowtimeSeatLabel(showtimeSeat),
         price: priceBySeatId.get(showtimeSeat.id) ?? showtimeSeat.price,
      }));
}

export function buildSummaryFnbLines(
   fnbMenu: FnbMenu | undefined,
   fnbSelectionLines: FnbSelectionLine[],
): SummaryFnbLine[] {
   if (!fnbMenu) {
      return [];
   }
   return fnbSelectionLines.flatMap((fnbSelectionLine): SummaryFnbLine[] => {
      const fnbProduct: FnbCombo | FnbItem | undefined =
         fnbSelectionLine.kind === 'COMBO'
            ? fnbMenu.combos.find((fnbCombo) => fnbCombo.id === fnbSelectionLine.productId)
            : fnbMenu.items.find((fnbItem) => fnbItem.id === fnbSelectionLine.productId);
      if (!fnbProduct) {
         return [];
      }
      return [
         {
            key: `${fnbSelectionLine.kind}-${fnbSelectionLine.productId}`,
            name: fnbProduct.name,
            quantity: fnbSelectionLine.quantity,
            amount: fnbProduct.price * fnbSelectionLine.quantity,
         },
      ];
   });
}
