export type FnbLineKind = 'COMBO' | 'ITEM';

export interface FnbSelectionLine {
  kind: FnbLineKind;
  productId: number;
  quantity: number;
}

export interface FnbSelection {
  showtimeId: number;
  lines: FnbSelectionLine[];
}
