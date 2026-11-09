import type { ReactElement } from 'react';
import { EMPTY_CELL_CLASS_NAME, MAINTENANCE_SEAT_CLASS_NAME, formatSurcharge, getSeatTypeStyle } from '@/lib/seatMap';
import type { SeatType } from '@/types/cinema';

interface SeatLegendProps {
   seatTypes: SeatType[];
   showMaintenance?: boolean;
   showEmptyCell?: boolean;
}

interface SeatSwatchProps {
   className: string;
   widthUnits: number;
   isDashed?: boolean;
}

export function SeatSwatch({ className, widthUnits, isDashed = false }: SeatSwatchProps): ReactElement {
   const width: number = widthUnits * 18 + (widthUnits - 1) * 3;
   return (
      <svg width={width + 4} height={22} aria-hidden="true">
         <rect
            x={2}
            y={2}
            width={width}
            height={18}
            rx={5}
            strokeWidth={1.5}
            strokeDasharray={isDashed ? '3 3' : undefined}
            className={className}
         />
      </svg>
   );
}

export function SeatLegend({
   seatTypes,
   showMaintenance = false,
   showEmptyCell = false,
}: SeatLegendProps): ReactElement {
   return (
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-600">
         {seatTypes.map((seatType) => (
            <li key={seatType.code} className="flex items-center gap-2">
               <SeatSwatch className={getSeatTypeStyle(seatType.code).seatClassName} widthUnits={seatType.span} />
               <span>
                  <strong className="font-semibold text-ink-800">{seatType.name}</strong>
                  <span className="ml-1 text-ink-500">{formatSurcharge(seatType.defaultSurcharge)}</span>
               </span>
            </li>
         ))}
         {showMaintenance && (
            <li className="flex items-center gap-2">
               <SeatSwatch className={MAINTENANCE_SEAT_CLASS_NAME} widthUnits={1} />
               <span className="font-semibold text-ink-800">Bảo trì</span>
            </li>
         )}
         {showEmptyCell && (
            <li className="flex items-center gap-2">
               <SeatSwatch className={EMPTY_CELL_CLASS_NAME} widthUnits={1} isDashed />
               <span className="font-semibold text-ink-800">Lối đi / ô trống</span>
            </li>
         )}
      </ul>
   );
}

export default SeatLegend;
