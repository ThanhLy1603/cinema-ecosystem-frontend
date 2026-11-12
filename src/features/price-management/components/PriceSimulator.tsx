import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactElement } from 'react';
import { simulatePrices } from '@/api/showtime/pricingApi';
import ShowtimePriceTable from '@/components/common/ShowtimePriceTable';
import Alert from '@/components/ui/Alert';
import SelectField from '@/components/ui/SelectField';
import TextField from '@/components/ui/TextField';
import { getErrorMessage } from '@/lib/common/apiError';
import { parseValidMoneyInput, validateMoneyInput } from '@/lib/common/moneyInput';
import { priceSimulationKey } from '@/lib/showtime/priceQueryKeys';
import { SCREEN_TYPE_OPTIONS } from '@/lib/showtime/priceLabels';
import { useDebouncedValue } from '@/lib/common/useDebouncedValue';
import {
   formatDisplayDate,
   getWeekdayLabel,
   isValidDate,
   isValidTimeOfDay,
   todayInVietnam,
   toVietnamInstant,
} from '@/lib/common/vietnamTime';
import type { ScreenType } from '@/types/cinema/cinema';
import type { PriceSimulationRequest, ShowtimePrice } from '@/types/showtime/pricing';

const DEBOUNCE_MS: number = 400;

interface SimulatorInputs {
   basePrice: string;
   screenType: string;
   date: string;
   startTime: string;
}

function buildRequest(simulatorInputs: SimulatorInputs): PriceSimulationRequest | null {
   const basePrice: number | null = parseValidMoneyInput(simulatorInputs.basePrice);
   const hasValidMoment: boolean = isValidDate(simulatorInputs.date) && isValidTimeOfDay(simulatorInputs.startTime);
   if (basePrice === null || simulatorInputs.screenType === '' || !hasValidMoment) {
      return null;
   }
   return {
      basePrice,
      screenType: simulatorInputs.screenType as ScreenType,
      startTime: toVietnamInstant(simulatorInputs.date, simulatorInputs.startTime),
   };
}

export function PriceSimulator(): ReactElement {
   const [simulatorInputs, setSimulatorInputs] = useState<SimulatorInputs>({
      basePrice: '90000',
      screenType: '2D',
      date: todayInVietnam(),
      startTime: '19:00',
   });
   const debouncedSimulatorInputs: SimulatorInputs = useDebouncedValue<SimulatorInputs>(simulatorInputs, DEBOUNCE_MS);
   const priceSimulationRequest: PriceSimulationRequest | null = buildRequest(debouncedSimulatorInputs);
   const simulationQuery: UseQueryResult<ShowtimePrice> = useQuery<ShowtimePrice>({
      queryKey: priceSimulationRequest ? priceSimulationKey(priceSimulationRequest) : ['price-simulation', 'idle'],
      queryFn: () => simulatePrices(priceSimulationRequest as PriceSimulationRequest),
      enabled: priceSimulationRequest !== null,
      placeholderData: (previousShowtimePrice) => previousShowtimePrice,
   });

   function updateInput(fieldName: keyof SimulatorInputs, fieldValue: string): void {
      setSimulatorInputs({ ...simulatorInputs, [fieldName]: fieldValue });
   }

   const hasInvalidInput: boolean = buildRequest(simulatorInputs) === null;

   return (
      <section className="space-y-5 rounded-lg bg-white p-5 shadow-card ring-1 ring-ink-200/80">
         <div>
            <h2 className="text-[15px] font-semibold text-ink-900">Tính thử giá vé</h2>
            <p className="mt-1 text-sm text-ink-500">
               Chọn giá gốc, loại phòng và giờ chiếu để xem giá từng loại ghế theo các quy tắc đang áp dụng.
            </p>
         </div>
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField
               id="simulator-base-price"
               label="Giá vé gốc (VNĐ)"
               value={simulatorInputs.basePrice}
               onChange={(basePrice) => updateInput('basePrice', basePrice)}
               error={validateMoneyInput(simulatorInputs.basePrice, 'Vui lòng nhập giá gốc', 'Giá gốc')}
            />
            <SelectField
               id="simulator-screen-type"
               label="Loại phòng"
               value={simulatorInputs.screenType}
               onChange={(screenType) => updateInput('screenType', screenType)}
               options={SCREEN_TYPE_OPTIONS}
               error={simulatorInputs.screenType === '' ? 'Vui lòng chọn loại phòng' : undefined}
               placeholder="Chọn loại phòng"
            />
            <TextField
               id="simulator-date"
               label="Ngày chiếu"
               type="date"
               value={simulatorInputs.date}
               onChange={(date) => updateInput('date', date)}
               error={isValidDate(simulatorInputs.date) ? undefined : 'Ngày không hợp lệ'}
            />
            <TextField
               id="simulator-time"
               label="Giờ bắt đầu"
               type="time"
               value={simulatorInputs.startTime}
               onChange={(startTime) => updateInput('startTime', startTime)}
               error={isValidTimeOfDay(simulatorInputs.startTime) ? undefined : 'Giờ không hợp lệ'}
            />
         </div>
         {simulationQuery.isError && <Alert variant="error">{getErrorMessage(simulationQuery.error)}</Alert>}
         {simulationQuery.data && (
            <div className="space-y-2">
               <p className="text-sm font-semibold text-ink-700">
                  {isValidDate(debouncedSimulatorInputs.date) &&
                     `${getWeekdayLabel(debouncedSimulatorInputs.date)}, ${formatDisplayDate(debouncedSimulatorInputs.date)} · ${debouncedSimulatorInputs.startTime} · Phòng ${debouncedSimulatorInputs.screenType}`}
               </p>
               <ShowtimePriceTable showtimePrice={simulationQuery.data} />
            </div>
         )}
         {simulationQuery.isPending && !hasInvalidInput && <p className="text-sm text-ink-500">Đang tính giá...</p>}
      </section>
   );
}

export default PriceSimulator;
