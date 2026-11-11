import type { BookingFnb, BookingFnbLineRequest, BookingFnbRequest } from '@/types/booking/bookingFnb';
import type { FnbLineKind, FnbSelectionLine } from '@/types/booking/fnbSelection';
import type { FnbMenu } from '@/types/fnb/fnb';

export const MAX_FNB_QUANTITY_PER_LINE: number = 10;

export function findSelectionQuantity(
   fnbSelectionLines: FnbSelectionLine[],
   fnbLineKind: FnbLineKind,
   productId: number,
): number {
   const fnbSelectionLine: FnbSelectionLine | undefined = fnbSelectionLines.find(
      (existingFnbSelectionLine) =>
         existingFnbSelectionLine.kind === fnbLineKind && existingFnbSelectionLine.productId === productId,
   );
   return fnbSelectionLine?.quantity ?? 0;
}

export function changeSelectionQuantity(
   fnbSelectionLines: FnbSelectionLine[],
   fnbLineKind: FnbLineKind,
   productId: number,
   quantity: number,
): FnbSelectionLine[] {
   const clampedQuantity: number = Math.max(0, Math.min(MAX_FNB_QUANTITY_PER_LINE, quantity));
   const remainingFnbSelectionLines: FnbSelectionLine[] = fnbSelectionLines.filter(
      (existingFnbSelectionLine) =>
         existingFnbSelectionLine.kind !== fnbLineKind || existingFnbSelectionLine.productId !== productId,
   );
   return clampedQuantity === 0
      ? remainingFnbSelectionLines
      : [...remainingFnbSelectionLines, { kind: fnbLineKind, productId, quantity: clampedQuantity }];
}

export function toBookingFnbRequest(fnbSelectionLines: FnbSelectionLine[]): BookingFnbRequest {
   return {
      lines: fnbSelectionLines.map((fnbSelectionLine): BookingFnbLineRequest => ({
         comboId: fnbSelectionLine.kind === 'COMBO' ? fnbSelectionLine.productId : null,
         itemId: fnbSelectionLine.kind === 'ITEM' ? fnbSelectionLine.productId : null,
         quantity: fnbSelectionLine.quantity,
      })),
   };
}

export function toFnbSelectionLines(bookingFnb: BookingFnb): FnbSelectionLine[] {
   return bookingFnb.lines.flatMap((bookingFnbLine): FnbSelectionLine[] => {
      if (bookingFnbLine.comboId !== null) {
         return [{ kind: 'COMBO', productId: bookingFnbLine.comboId, quantity: bookingFnbLine.quantity }];
      }
      if (bookingFnbLine.itemId !== null) {
         return [{ kind: 'ITEM', productId: bookingFnbLine.itemId, quantity: bookingFnbLine.quantity }];
      }
      return [];
   });
}

export function keepOrderableSelectionLines(
   fnbSelectionLines: FnbSelectionLine[],
   fnbMenu: FnbMenu,
): FnbSelectionLine[] {
   return fnbSelectionLines
      .filter((fnbSelectionLine) =>
         fnbSelectionLine.kind === 'COMBO'
            ? fnbMenu.combos.some((fnbCombo) => fnbCombo.id === fnbSelectionLine.productId)
            : fnbMenu.items.some((fnbItem) => fnbItem.id === fnbSelectionLine.productId),
      )
      .map((fnbSelectionLine) => ({
         ...fnbSelectionLine,
         quantity: Math.min(MAX_FNB_QUANTITY_PER_LINE, fnbSelectionLine.quantity),
      }));
}
