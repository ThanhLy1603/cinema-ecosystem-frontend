import { useRef, type PointerEvent, type ReactElement } from 'react';
import {
   EMPTY_CELL_CLASS_NAME,
   SEAT_CELL_HEIGHT,
   SEAT_CELL_PITCH_X,
   SEAT_CELL_PITCH_Y,
   SEAT_CELL_WIDTH,
   SEAT_LABEL_WIDTH,
   SEAT_SCREEN_HEIGHT,
   getCellX,
   getCellY,
   getGridHeight,
   getGridWidth,
   getRowIndex,
   getSeatLabel,
   getSeatWidth,
   type SeatVisualState,
   type GridCell,
   type GridSeat,
} from '@/lib/cinema/seatMap';
import { cn } from '@/lib/common/utils';
import SeatIcon from './SeatIcon';

interface SeatGridProps {
   rows: string[];
   columns: number;
   seats: GridSeat[];
   ariaLabel: string;
   showEmptyCells?: boolean;
   selectedSeatLabels?: ReadonlySet<string>;
   onCellPointerDown?: (gridCell: GridCell) => void;
   onCellPointerMove?: (gridCell: GridCell) => void;
   onPointerEnd?: () => void;
   onRowLabelClick?: (row: string) => void;
   onColumnLabelClick?: (column: number) => void;
}

function buildCells(rows: string[], columns: number): GridCell[] {
   const gridCells: GridCell[] = [];
   for (const row of rows) {
      for (let column: number = 1; column <= columns; column += 1) {
         gridCells.push({ row, column });
      }
   }
   return gridCells;
}

function buildOccupiedCellKeys(seats: GridSeat[]): Set<string> {
   const occupiedCellKeys: Set<string> = new Set<string>();
   for (const gridSeat of seats) {
      for (let column: number = gridSeat.number; column < gridSeat.number + gridSeat.span; column += 1) {
         occupiedCellKeys.add(`${gridSeat.row}:${column}`);
      }
   }
   return occupiedCellKeys;
}

function buildColumnNumbers(columns: number): number[] {
   const columnNumbers: number[] = [];
   for (let column: number = 1; column <= columns; column += 1) {
      columnNumbers.push(column);
   }
   return columnNumbers;
}

interface SeatShapeProps {
   gridSeat: GridSeat;
   isSelected: boolean;
}

function resolveVisualState(gridSeat: GridSeat, isSelected: boolean): SeatVisualState {
   if (gridSeat.visualState) {
      return gridSeat.visualState;
   }
   if (gridSeat.status === 'MAINTENANCE') {
      return 'maintenance';
   }
   return isSelected ? 'selected' : 'available';
}

function SeatShape({ gridSeat, isSelected }: SeatShapeProps): ReactElement {
   const seatLabel: string =
      gridSeat.span > 1 ? `${gridSeat.number}-${gridSeat.number + gridSeat.span - 1}` : String(gridSeat.number);

   return (
      <g aria-label={`Ghế ${getSeatLabel(gridSeat.row, gridSeat.number)}`}>
         <SeatIcon
            x={getCellX(gridSeat.number)}
            y={getCellY(getRowIndex(gridSeat.row))}
            width={getSeatWidth(gridSeat.span)}
            seatTypeCode={gridSeat.type}
            visualState={resolveVisualState(gridSeat, isSelected)}
            label={seatLabel}
         />
      </g>
   );
}

export function SeatGrid({
   rows,
   columns,
   seats,
   ariaLabel,
   showEmptyCells = false,
   selectedSeatLabels,
   onCellPointerDown,
   onCellPointerMove,
   onPointerEnd,
   onRowLabelClick,
   onColumnLabelClick,
}: SeatGridProps): ReactElement {
   const svgRef = useRef<SVGSVGElement>(null);
   const lastCellKeyRef = useRef<string | null>(null);
   const isDraggingRef = useRef<boolean>(false);
   const isInteractive: boolean = Boolean(onCellPointerDown);
   const width: number = getGridWidth(columns);
   const height: number = getGridHeight(rows.length);
   const occupiedCellKeys: Set<string> = buildOccupiedCellKeys(seats);
   const gridCells: GridCell[] = showEmptyCells
      ? buildCells(rows, columns).filter((gridCell) => !occupiedCellKeys.has(`${gridCell.row}:${gridCell.column}`))
      : [];
   const columnNumbers: number[] = buildColumnNumbers(columns);
   const rowsWithSeats: Set<string> = new Set(seats.map((gridSeat) => gridSeat.row));
   const labelledRows: string[] = showEmptyCells ? rows : rows.filter((row) => rowsWithSeats.has(row));

   function resolveCell(pointerEvent: PointerEvent<SVGSVGElement>): GridCell | null {
      const svgElement: SVGSVGElement | null = svgRef.current;
      if (!svgElement) {
         return null;
      }
      const boundingClientRect: DOMRect = svgElement.getBoundingClientRect();
      const scale: number = width / boundingClientRect.width;
      const x: number = (pointerEvent.clientX - boundingClientRect.left) * scale;
      const y: number = (pointerEvent.clientY - boundingClientRect.top) * scale;
      const column: number = Math.floor((x - SEAT_LABEL_WIDTH) / SEAT_CELL_PITCH_X) + 1;
      const rowIndex: number = Math.floor((y - SEAT_SCREEN_HEIGHT) / SEAT_CELL_PITCH_Y);
      if (column < 1 || column > columns || rowIndex < 0 || rowIndex >= rows.length) {
         return null;
      }
      return { row: rows[rowIndex], column };
   }

   function handlePointerDown(pointerEvent: PointerEvent<SVGSVGElement>): void {
      if (!onCellPointerDown || pointerEvent.button !== 0) {
         return;
      }
      const gridCell: GridCell | null = resolveCell(pointerEvent);
      if (!gridCell) {
         return;
      }
      pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
      isDraggingRef.current = true;
      lastCellKeyRef.current = `${gridCell.row}:${gridCell.column}`;
      onCellPointerDown(gridCell);
   }

   function handlePointerMove(pointerEvent: PointerEvent<SVGSVGElement>): void {
      if (!isDraggingRef.current || !onCellPointerMove) {
         return;
      }
      const gridCell: GridCell | null = resolveCell(pointerEvent);
      if (!gridCell) {
         return;
      }
      const cellKey: string = `${gridCell.row}:${gridCell.column}`;
      if (cellKey === lastCellKeyRef.current) {
         return;
      }
      lastCellKeyRef.current = cellKey;
      onCellPointerMove(gridCell);
   }

   function handlePointerEnd(pointerEvent: PointerEvent<SVGSVGElement>): void {
      if (!isDraggingRef.current) {
         return;
      }
      isDraggingRef.current = false;
      lastCellKeyRef.current = null;
      if (pointerEvent.currentTarget.hasPointerCapture(pointerEvent.pointerId)) {
         pointerEvent.currentTarget.releasePointerCapture(pointerEvent.pointerId);
      }
      onPointerEnd?.();
   }

   return (
      <div className="overflow-x-auto">
         <svg
            ref={svgRef}
            role="img"
            aria-label={ariaLabel}
            viewBox={`0 0 ${width} ${height}`}
            className={cn('mx-auto block h-auto w-full select-none', isInteractive && 'cursor-crosshair touch-none')}
            style={{ minWidth: Math.min(width, 520), maxWidth: width * 1.6 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
         >
            <path
               d={`M ${SEAT_LABEL_WIDTH} 22 Q ${width / 2} 0 ${width - SEAT_LABEL_WIDTH} 22`}
               className="fill-none stroke-ink-300"
               strokeWidth={5}
               strokeLinecap="round"
            />
            <text
               x={width / 2}
               y={40}
               textAnchor="middle"
               className="fill-ink-400 text-[11px] font-bold tracking-[0.3em]"
            >
               MÀN HÌNH
            </text>

            {gridCells.map((gridCell) => (
               <rect
                  key={`empty-${gridCell.row}-${gridCell.column}`}
                  x={getCellX(gridCell.column)}
                  y={getCellY(getRowIndex(gridCell.row))}
                  width={SEAT_CELL_WIDTH}
                  height={SEAT_CELL_HEIGHT}
                  rx={8}
                  strokeDasharray="3 3"
                  className={EMPTY_CELL_CLASS_NAME}
               />
            ))}

            {labelledRows.map((row) => (
               <text
                  key={`row-${row}`}
                  x={SEAT_LABEL_WIDTH / 2}
                  y={getCellY(getRowIndex(row)) + SEAT_CELL_HEIGHT / 2 + 4}
                  textAnchor="middle"
                  className={cn(
                     'fill-ink-500 text-[12px] font-bold',
                     onRowLabelClick && 'cursor-pointer hover:fill-brand-600',
                  )}
                  onPointerDown={(pointerEvent) => pointerEvent.stopPropagation()}
                  onClick={() => onRowLabelClick?.(row)}
               >
                  {row}
               </text>
            ))}

            {onColumnLabelClick &&
               columnNumbers.map((column) => (
                  <text
                     key={`column-${column}`}
                     x={getCellX(column) + SEAT_CELL_WIDTH / 2}
                     y={height - 8}
                     textAnchor="middle"
                     className="cursor-pointer fill-ink-400 text-[10px] font-semibold hover:fill-brand-600"
                     onPointerDown={(pointerEvent) => pointerEvent.stopPropagation()}
                     onClick={() => onColumnLabelClick(column)}
                  >
                     {column}
                  </text>
               ))}

            {seats.map((gridSeat) => (
               <SeatShape
                  key={getSeatLabel(gridSeat.row, gridSeat.number)}
                  gridSeat={gridSeat}
                  isSelected={selectedSeatLabels?.has(getSeatLabel(gridSeat.row, gridSeat.number)) ?? false}
               />
            ))}
         </svg>
      </div>
   );
}

export default SeatGrid;
