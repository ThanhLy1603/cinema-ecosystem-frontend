import { useRef, type PointerEvent, type ReactElement } from 'react';
import {
   EMPTY_CELL_CLASS_NAME,
   MAINTENANCE_SEAT_CLASS_NAME,
   SEAT_CELL_PITCH,
   SEAT_CELL_SIZE,
   SEAT_LABEL_WIDTH,
   SEAT_SCREEN_HEIGHT,
   getCellX,
   getCellY,
   getGridHeight,
   getGridWidth,
   getRowIndex,
   getSeatLabel,
   getSeatTypeStyle,
   type GridCell,
   type GridSeat,
} from '@/lib/seatMap';
import { cn } from '@/lib/utils';

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

function SeatShape({ gridSeat, isSelected }: SeatShapeProps): ReactElement {
   const seatLabel: string = getSeatLabel(gridSeat.row, gridSeat.number);
   const seatWidth: number = gridSeat.span * SEAT_CELL_SIZE + (gridSeat.span - 1) * (SEAT_CELL_PITCH - SEAT_CELL_SIZE);
   const x: number = getCellX(gridSeat.number);
   const y: number = getCellY(getRowIndex(gridSeat.row));
   const isMaintenance: boolean = gridSeat.status === 'MAINTENANCE';
   const seatClassName: string = isMaintenance
      ? MAINTENANCE_SEAT_CLASS_NAME
      : getSeatTypeStyle(gridSeat.type).seatClassName;
   const crossPath: string = `M ${x + 8} ${y + 8} L ${x + seatWidth - 8} ${y + SEAT_CELL_SIZE - 8} M ${x + seatWidth - 8} ${y + 8} L ${x + 8} ${y + SEAT_CELL_SIZE - 8}`;

   return (
      <g aria-label={`Ghế ${seatLabel}`}>
         <rect
            x={x}
            y={y}
            width={seatWidth}
            height={SEAT_CELL_SIZE}
            rx={8}
            strokeWidth={isSelected ? 3 : 1.5}
            className={seatClassName}
         />
         {isMaintenance ? (
            <path d={crossPath} className="stroke-ink-500" strokeWidth={2} strokeLinecap="round" />
         ) : (
            <text
               x={x + seatWidth / 2}
               y={y + SEAT_CELL_SIZE / 2 + 4}
               textAnchor="middle"
               className="pointer-events-none fill-ink-800 text-[11px] font-semibold"
            >
               {gridSeat.number}
            </text>
         )}
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
   const gridCells: GridCell[] = showEmptyCells ? buildCells(rows, columns) : [];
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
      const column: number = Math.floor((x - SEAT_LABEL_WIDTH) / SEAT_CELL_PITCH) + 1;
      const rowIndex: number = Math.floor((y - SEAT_SCREEN_HEIGHT) / SEAT_CELL_PITCH);
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
                  width={SEAT_CELL_SIZE}
                  height={SEAT_CELL_SIZE}
                  rx={8}
                  strokeDasharray="3 3"
                  className={EMPTY_CELL_CLASS_NAME}
               />
            ))}

            {labelledRows.map((row) => (
               <text
                  key={`row-${row}`}
                  x={SEAT_LABEL_WIDTH / 2}
                  y={getCellY(getRowIndex(row)) + SEAT_CELL_SIZE / 2 + 4}
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
                     x={getCellX(column) + SEAT_CELL_SIZE / 2}
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
