import type { FnbLineKind, FnbSelectionLine } from '@/types/booking/fnbSelection';
import type { FnbMenu } from '@/types/fnb/fnb';

export interface FnbProductRow {
   kind: FnbLineKind;
   id: number;
   name: string;
   description: string | null;
   imageUrl: string | null;
   price: number;
}

export function buildFnbProductRows(fnbMenu: FnbMenu): FnbProductRow[] {
   const comboRows: FnbProductRow[] = fnbMenu.combos
      .filter((fnbCombo) => fnbCombo.orderable)
      .map((fnbCombo): FnbProductRow => ({
         kind: 'COMBO',
         id: fnbCombo.id,
         name: fnbCombo.name,
         description: fnbCombo.items
            .map((fnbComboItem) => `${fnbComboItem.quantity} ${fnbComboItem.itemName}`)
            .join(' + '),
         imageUrl: fnbCombo.imageUrl,
         price: fnbCombo.price,
      }));
   const itemRows: FnbProductRow[] = fnbMenu.items.map((fnbItem): FnbProductRow => ({
      kind: 'ITEM',
      id: fnbItem.id,
      name: fnbItem.name,
      description: null,
      imageUrl: fnbItem.imageUrl,
      price: fnbItem.price,
   }));
   return [...comboRows, ...itemRows];
}

export function sumSelectionAmount(fnbSelectionLines: FnbSelectionLine[], fnbProductRows: FnbProductRow[]): number {
   return fnbSelectionLines.reduce((sumAmount, fnbSelectionLine) => {
      const fnbProductRow: FnbProductRow | undefined = fnbProductRows.find(
         (candidateRow) =>
            candidateRow.kind === fnbSelectionLine.kind && candidateRow.id === fnbSelectionLine.productId,
      );
      return sumAmount + (fnbProductRow?.price ?? 0) * fnbSelectionLine.quantity;
   }, 0);
}

export function sumSelectionQuantity(fnbSelectionLines: FnbSelectionLine[]): number {
   return fnbSelectionLines.reduce((sumQuantity, fnbSelectionLine) => sumQuantity + fnbSelectionLine.quantity, 0);
}
