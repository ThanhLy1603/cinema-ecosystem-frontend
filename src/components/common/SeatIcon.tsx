import type { ReactElement } from 'react';
import { SEAT_CELL_HEIGHT, SEAT_STATE_FILLS, getSeatTypeStyle, type SeatVisualState } from '@/lib/cinema/seatMap';

interface SeatIconProps {
   x: number;
   y: number;
   width: number;
   seatTypeCode: string;
   visualState?: SeatVisualState;
   label?: string;
}

const ICON_UNIT_HEIGHT: number = 36;
const ARM_WIDTH: number = 10;
const GAP: number = 1.2;

function resolveFill(seatTypeCode: string, visualState: SeatVisualState): string {
   return visualState === 'available' ? getSeatTypeStyle(seatTypeCode).fill : SEAT_STATE_FILLS[visualState];
}

function buildFramePath(unitWidth: number): string {
   const right: number = unitWidth;
   return [
      'M 0 8 A 4 4 0 0 1 4 4 H 7 A 3 3 0 0 1 10 7',
      'V 22.3 A 4 4 0 0 0 14 26.3',
      `H ${right - 14} A 4 4 0 0 0 ${right - 10} 22.3`,
      `V 7 A 3 3 0 0 1 ${right - 7} 4`,
      `H ${right - 4} A 4 4 0 0 1 ${right} 8`,
      `V 29 A 7 7 0 0 1 ${right - 7} 36`,
      'H 7 A 7 7 0 0 1 0 29 Z',
   ].join(' ');
}

export function SeatIcon({ x, y, width, seatTypeCode, visualState = 'available', label }: SeatIconProps): ReactElement {
   const scale: number = SEAT_CELL_HEIGHT / ICON_UNIT_HEIGHT;
   const unitWidth: number = width / scale;
   const fill: string = resolveFill(seatTypeCode, visualState);
   const isMaintenance: boolean = visualState === 'maintenance';
   const isSold: boolean = visualState === 'sold';
   const isHeld: boolean = visualState === 'held';
   const centerX: number = unitWidth / 2;

   return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
         <path d={buildFramePath(unitWidth)} fill={fill} />
         <rect x={ARM_WIDTH + GAP} y={0} width={unitWidth - (ARM_WIDTH + GAP) * 2} height={25.1} rx={5} fill={fill} />
         {isMaintenance && (
            <path
               d={`M ${centerX - 5} 7 L ${centerX + 5} 18 M ${centerX + 5} 7 L ${centerX - 5} 18`}
               strokeWidth={2.2}
               strokeLinecap="round"
               className="stroke-ink-400"
            />
         )}
         {isHeld && (
            <g className="stroke-white" fill="none" strokeWidth={2} strokeLinecap="round">
               <circle cx={centerX} cy={12.5} r={6.5} />
               <path d={`M ${centerX} 9 V 12.5 L ${centerX + 2.8} 14.3`} />
            </g>
         )}
         {label && !isMaintenance && !isHeld && (
            <text
               x={centerX}
               y={16.5}
               textAnchor="middle"
               fontSize={13}
               fontWeight={700}
               className={isSold ? 'pointer-events-none fill-white' : 'pointer-events-none fill-ink-900'}
            >
               {label}
            </text>
         )}
      </g>
   );
}

export default SeatIcon;
