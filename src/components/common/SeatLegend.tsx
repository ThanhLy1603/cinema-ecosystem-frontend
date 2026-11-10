import type { ReactElement } from 'react';
import {
   EMPTY_CELL_CLASS_NAME,
   SEAT_CELL_HEIGHT,
   SEAT_STATE_LABELS,
   formatSurcharge,
   getSeatWidth,
   type SeatVisualState,
} from '@/lib/cinema/seatMap';
import type { SeatType } from '@/types/cinema/cinema';
import SeatIcon from './SeatIcon';

type SeatStateVariant = Exclude<SeatVisualState, 'available'>;

interface SeatLegendProps {
   seatTypes: SeatType[];
   showMaintenance?: boolean;
   showEmptyCell?: boolean;
   bookingStates?: SeatStateVariant[];
}

interface SeatSwatchProps {
   seatTypeCode?: string;
   span?: number;
   variant?: SeatStateVariant | 'seat' | 'empty';
}

const SWATCH_SCALE: number = 0.7;
const SWATCH_PADDING: number = 2;

export function SeatSwatch({ seatTypeCode = 'STANDARD', span = 1, variant = 'seat' }: SeatSwatchProps): ReactElement {
   const width: number = getSeatWidth(span);
   const visualState: SeatVisualState = variant === 'seat' || variant === 'empty' ? 'available' : variant;
   return (
      <svg
         width={(width + SWATCH_PADDING * 2) * SWATCH_SCALE}
         height={(SEAT_CELL_HEIGHT + SWATCH_PADDING * 2) * SWATCH_SCALE}
         viewBox={`0 0 ${width + SWATCH_PADDING * 2} ${SEAT_CELL_HEIGHT + SWATCH_PADDING * 2}`}
         aria-hidden="true"
      >
         {variant === 'empty' ? (
            <rect
               x={SWATCH_PADDING}
               y={SWATCH_PADDING}
               width={width}
               height={SEAT_CELL_HEIGHT}
               rx={8}
               strokeWidth={1.5}
               strokeDasharray="3 3"
               className={EMPTY_CELL_CLASS_NAME}
            />
         ) : (
            <SeatIcon
               x={SWATCH_PADDING}
               y={SWATCH_PADDING}
               width={width}
               seatTypeCode={seatTypeCode}
               visualState={visualState}
            />
         )}
      </svg>
   );
}

export function SeatLegend({
   seatTypes,
   showMaintenance = false,
   showEmptyCell = false,
   bookingStates = [],
}: SeatLegendProps): ReactElement {
   const stateVariants: SeatStateVariant[] = showMaintenance ? ['maintenance', ...bookingStates] : bookingStates;

   return (
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-600">
         {seatTypes.map((seatType) => (
            <li key={seatType.code} className="flex items-center gap-2">
               <SeatSwatch seatTypeCode={seatType.code} span={seatType.span} />
               <span>
                  <strong className="font-semibold text-ink-800">{seatType.name}</strong>
                  <span className="ml-1 text-ink-500">{formatSurcharge(seatType.defaultSurcharge)}</span>
               </span>
            </li>
         ))}
         {stateVariants.map((stateVariant) => (
            <li key={stateVariant} className="flex items-center gap-2">
               <SeatSwatch variant={stateVariant} />
               <span className="font-semibold text-ink-800">{SEAT_STATE_LABELS[stateVariant]}</span>
            </li>
         ))}
         {showEmptyCell && (
            <li className="flex items-center gap-2">
               <SeatSwatch variant="empty" />
               <span className="font-semibold text-ink-800">Lối đi / ô trống</span>
            </li>
         )}
      </ul>
   );
}

export default SeatLegend;
