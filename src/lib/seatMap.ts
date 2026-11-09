import type { SeatStatus } from '@/types/cinema';

export const SEAT_CELL_SIZE: number = 34;
export const SEAT_CELL_GAP: number = 6;
export const SEAT_CELL_PITCH: number = SEAT_CELL_SIZE + SEAT_CELL_GAP;
export const SEAT_LABEL_WIDTH: number = 30;
export const SEAT_SCREEN_HEIGHT: number = 56;
export const SEAT_FOOTER_HEIGHT: number = 30;
export const MAX_SEAT_ROWS: number = 26;
export const MAX_SEAT_COLUMNS: number = 40;

export interface GridSeat {
   id?: number;
   row: string;
   number: number;
   type: string;
   span: number;
   status: SeatStatus;
}

export interface GridCell {
   row: string;
   column: number;
}

export interface SeatTypeStyle {
   seatClassName: string;
   label: string;
}

const FIRST_ROW_CHAR_CODE: number = 'A'.charCodeAt(0);

const SEAT_TYPE_STYLES: Record<string, SeatTypeStyle> = {
   STANDARD: { seatClassName: 'fill-white stroke-ink-300', label: 'Ghế thường' },
   VIP: { seatClassName: 'fill-gold-200 stroke-gold-500', label: 'Ghế VIP' },
   SWEETBOX: { seatClassName: 'fill-brand-100 stroke-brand-500', label: 'Ghế đôi Sweetbox' },
};

const FALLBACK_SEAT_STYLE: SeatTypeStyle = { seatClassName: 'fill-ink-100 stroke-ink-400', label: 'Ghế' };

export const MAINTENANCE_SEAT_CLASS_NAME: string = 'fill-ink-200 stroke-ink-400';
export const EMPTY_CELL_CLASS_NAME: string = 'fill-ink-50 stroke-ink-200';

export function getSeatTypeStyle(seatTypeCode: string): SeatTypeStyle {
   return SEAT_TYPE_STYLES[seatTypeCode] ?? FALLBACK_SEAT_STYLE;
}

export function getRowLetter(rowIndex: number): string {
   return String.fromCharCode(FIRST_ROW_CHAR_CODE + rowIndex);
}

export function getRowIndex(row: string): number {
   return row.charCodeAt(0) - FIRST_ROW_CHAR_CODE;
}

export function buildRowLetters(rowCount: number): string[] {
   const rowLetters: string[] = [];
   for (let rowIndex: number = 0; rowIndex < rowCount; rowIndex += 1) {
      rowLetters.push(getRowLetter(rowIndex));
   }
   return rowLetters;
}

export function getLayoutRowLetters(rows: string[]): string[] {
   if (rows.length === 0) {
      return [];
   }
   const highestRowIndex: number = Math.max(...rows.map((row) => getRowIndex(row)));
   return buildRowLetters(highestRowIndex + 1);
}

export function getSeatLabel(row: string, seatNumber: number): string {
   return `${row}${seatNumber}`;
}

export function getGridWidth(columns: number): number {
   return SEAT_LABEL_WIDTH * 2 + columns * SEAT_CELL_PITCH - SEAT_CELL_GAP;
}

export function getGridHeight(rowCount: number): number {
   return SEAT_SCREEN_HEIGHT + rowCount * SEAT_CELL_PITCH - SEAT_CELL_GAP + SEAT_FOOTER_HEIGHT;
}

export function getCellX(column: number): number {
   return SEAT_LABEL_WIDTH + (column - 1) * SEAT_CELL_PITCH;
}

export function getCellY(rowIndex: number): number {
   return SEAT_SCREEN_HEIGHT + rowIndex * SEAT_CELL_PITCH;
}

export function formatSurcharge(amount: number): string {
   return amount === 0 ? 'Không phụ thu' : `+${amount.toLocaleString('vi-VN')}đ`;
}
