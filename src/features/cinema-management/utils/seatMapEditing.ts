import {
   MAX_SEAT_COLUMNS,
   MAX_SEAT_ROWS,
   buildRowLetters,
   getRowIndex,
   getRowLetter,
   getSeatLabel,
   type GridCell,
   type GridSeat,
} from '@/lib/cinema/seatMap';
import type { SeatCellRequest, SeatLayout, SeatStatus, SeatType } from '@/types/cinema/cinema';

export type SeatTypesByCode = Record<string, SeatType>;

export interface EditorSeat {
   id?: number;
   row: string;
   number: number;
   seatTypeCode: string;
   status: SeatStatus;
}

export interface SeatMapDraft {
   rowCount: number;
   columns: number;
   seatsByLabel: Record<string, EditorSeat>;
}

export interface SeatBrushTool {
   kind: 'seat';
   seatTypeCode: string;
}

export interface EraseTool {
   kind: 'erase';
}

export interface MaintenanceTool {
   kind: 'maintenance';
}

export type EditorTool = SeatBrushTool | EraseTool | MaintenanceTool;

export const DEFAULT_ROW_COUNT: number = 8;
export const DEFAULT_COLUMN_COUNT: number = 12;

function getSpan(seatTypesByCode: SeatTypesByCode, seatTypeCode: string): number {
   return seatTypesByCode[seatTypeCode]?.span ?? 1;
}

function clamp(value: number, minimum: number, maximum: number): number {
   return Math.min(Math.max(value, minimum), maximum);
}

export function createEmptyDraft(): SeatMapDraft {
   return { rowCount: DEFAULT_ROW_COUNT, columns: DEFAULT_COLUMN_COUNT, seatsByLabel: {} };
}

export function createDraftFromLayout(seatLayout: SeatLayout): SeatMapDraft {
   if (seatLayout.seats.length === 0) {
      return createEmptyDraft();
   }
   const seatsByLabel: Record<string, EditorSeat> = {};
   let highestRowIndex: number = 0;
   for (const seatLayoutSeat of seatLayout.seats) {
      seatsByLabel[getSeatLabel(seatLayoutSeat.row, seatLayoutSeat.number)] = {
         id: seatLayoutSeat.id,
         row: seatLayoutSeat.row,
         number: seatLayoutSeat.number,
         seatTypeCode: seatLayoutSeat.type,
         status: seatLayoutSeat.status,
      };
      highestRowIndex = Math.max(highestRowIndex, getRowIndex(seatLayoutSeat.row));
   }
   return { rowCount: highestRowIndex + 1, columns: seatLayout.columns, seatsByLabel };
}

export function findCoveringSeat(
   seatMapDraft: SeatMapDraft,
   seatTypesByCode: SeatTypesByCode,
   row: string,
   column: number,
): EditorSeat | undefined {
   const directSeat: EditorSeat | undefined = seatMapDraft.seatsByLabel[getSeatLabel(row, column)];
   if (directSeat) {
      return directSeat;
   }
   const previousSeat: EditorSeat | undefined = seatMapDraft.seatsByLabel[getSeatLabel(row, column - 1)];
   if (previousSeat && getSpan(seatTypesByCode, previousSeat.seatTypeCode) > 1) {
      return previousSeat;
   }
   return undefined;
}

function withoutSeat(seatMapDraft: SeatMapDraft, editorSeat: EditorSeat): SeatMapDraft {
   const seatsByLabel: Record<string, EditorSeat> = { ...seatMapDraft.seatsByLabel };
   delete seatsByLabel[getSeatLabel(editorSeat.row, editorSeat.number)];
   return { ...seatMapDraft, seatsByLabel };
}

function paintSeat(
   seatMapDraft: SeatMapDraft,
   seatTypesByCode: SeatTypesByCode,
   seatTypeCode: string,
   gridCell: GridCell,
): SeatMapDraft {
   const coveringSeat: EditorSeat | undefined = findCoveringSeat(
      seatMapDraft,
      seatTypesByCode,
      gridCell.row,
      gridCell.column,
   );
   if (coveringSeat && coveringSeat.seatTypeCode === seatTypeCode) {
      return seatMapDraft;
   }
   const span: number = getSpan(seatTypesByCode, seatTypeCode);
   if (gridCell.column + span - 1 > seatMapDraft.columns) {
      return seatMapDraft;
   }
   const targetLabel: string = getSeatLabel(gridCell.row, gridCell.column);
   const preservedId: number | undefined = seatMapDraft.seatsByLabel[targetLabel]?.id;
   let nextSeatMapDraft: SeatMapDraft = seatMapDraft;
   for (let column: number = gridCell.column; column < gridCell.column + span; column += 1) {
      const occupyingSeat: EditorSeat | undefined = findCoveringSeat(
         nextSeatMapDraft,
         seatTypesByCode,
         gridCell.row,
         column,
      );
      if (occupyingSeat) {
         nextSeatMapDraft = withoutSeat(nextSeatMapDraft, occupyingSeat);
      }
   }
   return {
      ...nextSeatMapDraft,
      seatsByLabel: {
         ...nextSeatMapDraft.seatsByLabel,
         [targetLabel]: {
            id: preservedId,
            row: gridCell.row,
            number: gridCell.column,
            seatTypeCode,
            status: 'ACTIVE',
         },
      },
   };
}

function toggleMaintenance(seatMapDraft: SeatMapDraft, coveringSeat: EditorSeat): SeatMapDraft {
   const nextStatus: SeatStatus = coveringSeat.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
   return {
      ...seatMapDraft,
      seatsByLabel: {
         ...seatMapDraft.seatsByLabel,
         [getSeatLabel(coveringSeat.row, coveringSeat.number)]: { ...coveringSeat, status: nextStatus },
      },
   };
}

export function applyTool(
   seatMapDraft: SeatMapDraft,
   seatTypesByCode: SeatTypesByCode,
   editorTool: EditorTool,
   gridCell: GridCell,
): SeatMapDraft {
   if (editorTool.kind === 'seat') {
      return paintSeat(seatMapDraft, seatTypesByCode, editorTool.seatTypeCode, gridCell);
   }
   const coveringSeat: EditorSeat | undefined = findCoveringSeat(
      seatMapDraft,
      seatTypesByCode,
      gridCell.row,
      gridCell.column,
   );
   if (!coveringSeat) {
      return seatMapDraft;
   }
   return editorTool.kind === 'erase'
      ? withoutSeat(seatMapDraft, coveringSeat)
      : toggleMaintenance(seatMapDraft, coveringSeat);
}

export function applyToolToRow(
   seatMapDraft: SeatMapDraft,
   seatTypesByCode: SeatTypesByCode,
   editorTool: EditorTool,
   row: string,
): SeatMapDraft {
   let nextSeatMapDraft: SeatMapDraft = seatMapDraft;
   for (let column: number = 1; column <= seatMapDraft.columns; column += 1) {
      nextSeatMapDraft = applyTool(nextSeatMapDraft, seatTypesByCode, editorTool, { row, column });
   }
   return nextSeatMapDraft;
}

export function applyToolToColumn(
   seatMapDraft: SeatMapDraft,
   seatTypesByCode: SeatTypesByCode,
   editorTool: EditorTool,
   column: number,
): SeatMapDraft {
   let nextSeatMapDraft: SeatMapDraft = seatMapDraft;
   for (const row of buildRowLetters(seatMapDraft.rowCount)) {
      nextSeatMapDraft = applyTool(nextSeatMapDraft, seatTypesByCode, editorTool, { row, column });
   }
   return nextSeatMapDraft;
}

export function resizeDraft(
   seatMapDraft: SeatMapDraft,
   seatTypesByCode: SeatTypesByCode,
   rowCount: number,
   columns: number,
): SeatMapDraft {
   const nextRowCount: number = clamp(rowCount, 1, MAX_SEAT_ROWS);
   const nextColumns: number = clamp(columns, 1, MAX_SEAT_COLUMNS);
   const seatsByLabel: Record<string, EditorSeat> = {};
   for (const editorSeat of Object.values(seatMapDraft.seatsByLabel)) {
      const lastColumn: number = editorSeat.number + getSpan(seatTypesByCode, editorSeat.seatTypeCode) - 1;
      if (getRowIndex(editorSeat.row) < nextRowCount && lastColumn <= nextColumns) {
         seatsByLabel[getSeatLabel(editorSeat.row, editorSeat.number)] = editorSeat;
      }
   }
   return { rowCount: nextRowCount, columns: nextColumns, seatsByLabel };
}

export function createGridDraft(
   previousDraft: SeatMapDraft,
   seatTypesByCode: SeatTypesByCode,
   rowCount: number,
   columns: number,
   seatTypeCode: string,
): SeatMapDraft {
   const nextRowCount: number = clamp(rowCount, 1, MAX_SEAT_ROWS);
   const nextColumns: number = clamp(columns, 1, MAX_SEAT_COLUMNS);
   const span: number = getSpan(seatTypesByCode, seatTypeCode);
   const seatsByLabel: Record<string, EditorSeat> = {};
   for (let rowIndex: number = 0; rowIndex < nextRowCount; rowIndex += 1) {
      const row: string = getRowLetter(rowIndex);
      for (let number: number = 1; number + span - 1 <= nextColumns; number += span) {
         const label: string = getSeatLabel(row, number);
         seatsByLabel[label] = {
            id: previousDraft.seatsByLabel[label]?.id,
            row,
            number,
            seatTypeCode,
            status: 'ACTIVE',
         };
      }
   }
   return { rowCount: nextRowCount, columns: nextColumns, seatsByLabel };
}

function compareEditorSeats(firstEditorSeat: EditorSeat, secondEditorSeat: EditorSeat): number {
   if (firstEditorSeat.row !== secondEditorSeat.row) {
      return firstEditorSeat.row < secondEditorSeat.row ? -1 : 1;
   }
   return firstEditorSeat.number - secondEditorSeat.number;
}

export function listSeats(seatMapDraft: SeatMapDraft): EditorSeat[] {
   return Object.values(seatMapDraft.seatsByLabel).sort(compareEditorSeats);
}

export function toSeatCellRequests(seatMapDraft: SeatMapDraft): SeatCellRequest[] {
   return listSeats(seatMapDraft).map((editorSeat) => ({
      row: editorSeat.row,
      number: editorSeat.number,
      seatTypeCode: editorSeat.seatTypeCode,
      status: editorSeat.status,
   }));
}

export function serializeSeats(seatMapDraft: SeatMapDraft): string {
   return JSON.stringify(toSeatCellRequests(seatMapDraft));
}

export function toGridSeats(seatMapDraft: SeatMapDraft, seatTypesByCode: SeatTypesByCode): GridSeat[] {
   return listSeats(seatMapDraft).map((editorSeat) => ({
      id: editorSeat.id,
      row: editorSeat.row,
      number: editorSeat.number,
      type: editorSeat.seatTypeCode,
      span: getSpan(seatTypesByCode, editorSeat.seatTypeCode),
      status: editorSeat.status,
   }));
}

export interface SeatMapStatistics {
   totalSeats: number;
   maintenanceSeats: number;
   seatsByType: Record<string, number>;
}

export function computeStatistics(seatMapDraft: SeatMapDraft): SeatMapStatistics {
   const seatsByType: Record<string, number> = {};
   let maintenanceSeats: number = 0;
   for (const editorSeat of Object.values(seatMapDraft.seatsByLabel)) {
      seatsByType[editorSeat.seatTypeCode] = (seatsByType[editorSeat.seatTypeCode] ?? 0) + 1;
      if (editorSeat.status === 'MAINTENANCE') {
         maintenanceSeats += 1;
      }
   }
   return { totalSeats: Object.keys(seatMapDraft.seatsByLabel).length, maintenanceSeats, seatsByType };
}
