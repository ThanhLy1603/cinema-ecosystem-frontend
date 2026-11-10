import type { SeatStatus } from '@/types/cinema';

export const SEAT_CELL_WIDTH: number = 40;
export const SEAT_CELL_HEIGHT: number = 30;
export const SEAT_CELL_GAP: number = 6;
export const SEAT_CELL_PITCH_X: number = SEAT_CELL_WIDTH + SEAT_CELL_GAP;
export const SEAT_CELL_PITCH_Y: number = SEAT_CELL_HEIGHT + SEAT_CELL_GAP;
export const SEAT_LABEL_WIDTH: number = 30;
export const SEAT_SCREEN_HEIGHT: number = 56;
export const SEAT_FOOTER_HEIGHT: number = 30;
export const MAX_SEAT_ROWS: number = 26;
export const MAX_SEAT_COLUMNS: number = 40;

export type SeatVisualState = 'available' | 'selected' | 'held' | 'sold' | 'maintenance';

export interface GridSeat {
   id?: number;
   row: string;
   number: number;
   type: string;
   span: number;
   status: SeatStatus;
   visualState?: SeatVisualState;
}

export interface GridCell {
   row: string;
   column: number;
}

export interface SeatTypeStyle {
   fill: string;
   label: string;
}

const FIRST_ROW_CHAR_CODE: number = 'A'.charCodeAt(0);

const SEAT_TYPE_STYLES: Record<string, SeatTypeStyle> = {
   STANDARD: { fill: '#D9D9D9', label: 'Ghế thường' },
   VIP: { fill: '#FFEA7A', label: 'Ghế VIP' },
   SWEETBOX: { fill: '#08FFF9', label: 'Ghế đôi Sweetbox' },
};

const FALLBACK_SEAT_STYLE: SeatTypeStyle = SEAT_TYPE_STYLES.STANDARD;

export const SEAT_STATE_FILLS: Record<Exclude<SeatVisualState, 'available'>, string> = {
   selected: '#B2EC0F',
   held: '#FFA94D',
   sold: '#EE0000',
   maintenance: '#ECECEC',
};

export const SEAT_STATE_LABELS: Record<Exclude<SeatVisualState, 'available'>, string> = {
   selected: 'Ghế bạn chọn',
   held: 'Đang được giữ',
   sold: 'Đã bán',
   maintenance: 'Bảo trì',
};

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

export function getSeatWidth(span: number): number {
   return span * SEAT_CELL_WIDTH + (span - 1) * SEAT_CELL_GAP;
}

export function getSeatLabel(row: string, seatNumber: number): string {
   return `${row}${seatNumber}`;
}

export function getGridWidth(columns: number): number {
   return SEAT_LABEL_WIDTH * 2 + columns * SEAT_CELL_PITCH_X - SEAT_CELL_GAP;
}

export function getGridHeight(rowCount: number): number {
   return SEAT_SCREEN_HEIGHT + rowCount * SEAT_CELL_PITCH_Y - SEAT_CELL_GAP + SEAT_FOOTER_HEIGHT;
}

export function getCellX(column: number): number {
   return SEAT_LABEL_WIDTH + (column - 1) * SEAT_CELL_PITCH_X;
}

export function getCellY(rowIndex: number): number {
   return SEAT_SCREEN_HEIGHT + rowIndex * SEAT_CELL_PITCH_Y;
}

export function formatSurcharge(amount: number): string {
   return amount === 0 ? 'Không phụ thu' : `+${amount.toLocaleString('vi-VN')}đ`;
}
