import {
   useMutation,
   useQuery,
   useQueryClient,
   type QueryClient,
   type UseMutationResult,
   type UseQueryResult,
} from '@tanstack/react-query';
import { ArrowLeft, Clock } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import {
   cancelPendingBooking,
   getMySeatHold,
   getShowtimeSeatMap,
   holdSeat,
   releaseSeat,
} from '@/api/booking/bookingApi';
import type { ConnectionState } from '@/api/websocketClient';
import ConnectionBadge from '@/components/common/ConnectionBadge';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import SeatGrid from '@/components/common/SeatGrid';
import SeatLegend from '@/components/common/SeatLegend';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { mySeatHoldKey, showtimeSeatMapKey } from '@/lib/booking/bookingQueryKeys';
import { buildOrphanSeatMessage, findOrphanSeatLabels } from '@/lib/booking/seatGapRule';
import { MAX_SEATS_PER_BOOKING, compareShowtimeSeats, getShowtimeSeatLabel } from '@/lib/booking/seatLabels';
import { buildDisplayedSeatIds, formatCountdown, toGridSeat } from '@/lib/booking/seatSelection';
import { applySeatStatusMessage } from '@/lib/booking/seatStatusMessage';
import { useHoldCountdown } from '@/lib/booking/useHoldCountdown';
import { useSeatMapRealtime } from '@/lib/booking/useSeatMapRealtime';
import { getLayoutRowLetters, type GridSeat } from '@/lib/cinema/seatMap';
import { useSeatTypes } from '@/lib/cinema/useSeatTypes';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import { formatVnd } from '@/lib/common/currencyFormat';
import { formatClockRange, formatDisplayDate, toVietnamDate } from '@/lib/common/vietnamTime';
import type { SeatHold } from '@/types/booking/seatHold';
import type { SeatAvailability, ShowtimeSeat, ShowtimeSeatMap } from '@/types/booking/seatMap';
import type { SeatType } from '@/types/cinema/cinema';

const PENDING_OTHER_SHOWTIME_CODE: string = 'PENDING_BOOKING_OTHER_SHOWTIME';

const OCCUPIED_SEAT_NOTICES: Record<Exclude<SeatAvailability, 'AVAILABLE'>, string> = {
   HELD: 'Ghế đang được giữ bởi người khác.',
   SOLD: 'Ghế này đã được bán.',
   UNAVAILABLE: 'Ghế này đang bảo trì, không thể chọn.',
};

interface SalesSeatStepProps {
   showtimeId: number;
   onChangeShowtime: () => void;
   onContinue: () => void;
}

export function SalesSeatStep({ showtimeId, onChangeShowtime, onContinue }: SalesSeatStepProps): ReactElement {
   const queryClient: QueryClient = useQueryClient();
   const [notice, setNotice] = useState<string | null>(null);
   const [conflictSeatId, setConflictSeatId] = useState<number | null>(null);
   const seatTypesQuery: UseQueryResult<SeatType[]> = useSeatTypes();
   const seatMapQuery: UseQueryResult<ShowtimeSeatMap> = useQuery<ShowtimeSeatMap>({
      queryKey: showtimeSeatMapKey(showtimeId),
      queryFn: () => getShowtimeSeatMap(showtimeId),
      retry: false,
   });
   const myHoldQuery: UseQueryResult<SeatHold> = useQuery<SeatHold>({
      queryKey: mySeatHoldKey(showtimeId),
      queryFn: () => getMySeatHold(showtimeId),
   });
   const connectionState: ConnectionState = useSeatMapRealtime(seatMapQuery.isSuccess ? showtimeId : null);
   const showtimeSeatMap: ShowtimeSeatMap | undefined = seatMapQuery.data;
   const myHold: SeatHold | undefined = myHoldQuery.data;
   const mySeatIds: Set<number> = useMemo(
      () => new Set<number>((myHold?.seats ?? []).map((heldSeat) => heldSeat.seatId)),
      [myHold],
   );
   const remainingSeconds: number | null = useHoldCountdown(
      myHold?.expiresAt ?? null,
      myHold?.serverTime ?? null,
      myHoldQuery.dataUpdatedAt,
   );

   function refreshSeatState(): void {
      void queryClient.invalidateQueries({ queryKey: mySeatHoldKey(showtimeId) });
      void queryClient.invalidateQueries({ queryKey: showtimeSeatMapKey(showtimeId) });
   }

   function applySeatChange(seatId: number, state: SeatAvailability): void {
      queryClient.setQueryData<ShowtimeSeatMap>(showtimeSeatMapKey(showtimeId), (previousShowtimeSeatMap) =>
         previousShowtimeSeatMap === undefined
            ? previousShowtimeSeatMap
            : applySeatStatusMessage(previousShowtimeSeatMap, {
                 showtimeId,
                 changes: [{ seatId, state }],
                 occurredAt: new Date().toISOString(),
              }),
      );
   }

   function handleHoldFailure(error: unknown, seatId: number): void {
      if (getErrorCode(error) === PENDING_OTHER_SHOWTIME_CODE) {
         setConflictSeatId(seatId);
         setNotice(null);
         return;
      }
      setNotice(getErrorMessage(error));
      refreshSeatState();
   }

   const holdMutation: UseMutationResult<SeatHold, unknown, number> = useMutation<SeatHold, unknown, number>({
      mutationFn: (seatId: number) => holdSeat(showtimeId, seatId),
      onSuccess(seatHold: SeatHold, seatId: number): void {
         queryClient.setQueryData<SeatHold>(mySeatHoldKey(showtimeId), seatHold);
         applySeatChange(seatId, 'HELD');
         setNotice(null);
         setConflictSeatId(null);
      },
      onError: handleHoldFailure,
   });
   const releaseMutation: UseMutationResult<SeatHold, unknown, number> = useMutation<SeatHold, unknown, number>({
      mutationFn: (seatId: number) => releaseSeat(showtimeId, seatId),
      onSuccess(seatHold: SeatHold, seatId: number): void {
         queryClient.setQueryData<SeatHold>(mySeatHoldKey(showtimeId), seatHold);
         applySeatChange(seatId, 'AVAILABLE');
         setNotice(null);
      },
      onError(error: unknown): void {
         setNotice(getErrorMessage(error));
      },
   });
   const replaceBookingMutation: UseMutationResult<void, unknown, number> = useMutation<void, unknown, number>({
      mutationFn: async (seatId: number): Promise<void> => {
         await cancelPendingBooking();
         await holdSeat(showtimeId, seatId);
      },
      onSuccess(): void {
         setConflictSeatId(null);
         refreshSeatState();
      },
      onError(error: unknown): void {
         setNotice(getErrorMessage(error));
      },
   });
   const changeShowtimeMutation: UseMutationResult<void, unknown, void> = useMutation<void, unknown, void>({
      mutationFn: cancelPendingBooking,
      onSuccess(): void {
         refreshSeatState();
         onChangeShowtime();
      },
      onError(error: unknown): void {
         setNotice(getErrorMessage(error));
      },
   });
   const isBusy: boolean =
      holdMutation.isPending ||
      releaseMutation.isPending ||
      replaceBookingMutation.isPending ||
      changeShowtimeMutation.isPending;
   const holdingSeatId: number | null = holdMutation.isPending ? holdMutation.variables : null;
   const releasingSeatId: number | null = releaseMutation.isPending ? releaseMutation.variables : null;
   const displayedSeatIds: Set<number> = useMemo(
      () => buildDisplayedSeatIds(mySeatIds, holdingSeatId, releasingSeatId),
      [mySeatIds, holdingSeatId, releasingSeatId],
   );

   useEffect((): void => {
      if (remainingSeconds === 0 && myHold?.expiresAt) {
         void Promise.all([
            queryClient.invalidateQueries({ queryKey: mySeatHoldKey(showtimeId) }),
            queryClient.invalidateQueries({ queryKey: showtimeSeatMapKey(showtimeId) }),
         ]).then((): void => setNotice('Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế.'));
      }
   }, [remainingSeconds, myHold, queryClient, showtimeId]);

   useEffect((): void => {
      if (!showtimeSeatMap || myHoldQuery.isFetching) {
         return;
      }
      const hasLostSeat: boolean = showtimeSeatMap.seats.some(
         (showtimeSeat) => mySeatIds.has(showtimeSeat.id) && showtimeSeat.state !== 'HELD',
      );
      if (hasLostSeat) {
         void myHoldQuery.refetch();
      }
   }, [showtimeSeatMap, mySeatIds, myHoldQuery]);

   const gridSeats: GridSeat[] = useMemo(
      () =>
         (showtimeSeatMap?.seats ?? []).map((showtimeSeat) =>
            toGridSeat(
               showtimeSeat.id === releasingSeatId ? { ...showtimeSeat, state: 'AVAILABLE' } : showtimeSeat,
               displayedSeatIds.has(showtimeSeat.id),
            ),
         ),
      [showtimeSeatMap, displayedSeatIds, releasingSeatId],
   );
   const heldShowtimeSeats: ShowtimeSeat[] = useMemo(
      () =>
         (showtimeSeatMap?.seats ?? [])
            .filter((showtimeSeat) => displayedSeatIds.has(showtimeSeat.id))
            .sort(compareShowtimeSeats),
      [showtimeSeatMap, displayedSeatIds],
   );
   const orphanSeatLabels: string[] = useMemo(
      (): string[] => findOrphanSeatLabels(showtimeSeatMap?.seats ?? [], displayedSeatIds),
      [showtimeSeatMap, displayedSeatIds],
   );

   if (seatMapQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (seatMapQuery.isError || !showtimeSeatMap) {
      return (
         <div className="space-y-4">
            <Alert variant="error">{getErrorMessage(seatMapQuery.error)}</Alert>
            <Button variant="secondary" onClick={onChangeShowtime}>
               Chọn suất khác
            </Button>
         </div>
      );
   }

   const seatMap: ShowtimeSeatMap = showtimeSeatMap;
   const orphanSeatMessage: string | null =
      orphanSeatLabels.length > 0 ? buildOrphanSeatMessage(orphanSeatLabels) : null;
   const priceBySeatId: Map<number, number> = new Map<number, number>(
      (myHold?.seats ?? []).map((heldSeat) => [heldSeat.seatId, heldSeat.price]),
   );
   const totalAmount: number = heldShowtimeSeats.reduce(
      (sumAmount, showtimeSeat) => sumAmount + (priceBySeatId.get(showtimeSeat.id) ?? showtimeSeat.price),
      0,
   );
   const selectedSeatLabels: Set<string> = new Set<string>(heldShowtimeSeats.map(getShowtimeSeatLabel));

   function handleSeatPick(gridSeat: GridSeat): void {
      const pickedShowtimeSeat: ShowtimeSeat | undefined = seatMap.seats.find(
         (showtimeSeat) => showtimeSeat.id === gridSeat.id,
      );
      if (!pickedShowtimeSeat || isBusy) {
         return;
      }
      if (mySeatIds.has(pickedShowtimeSeat.id)) {
         releaseMutation.mutate(pickedShowtimeSeat.id);
         return;
      }
      if (pickedShowtimeSeat.state !== 'AVAILABLE') {
         setNotice(OCCUPIED_SEAT_NOTICES[pickedShowtimeSeat.state]);
         return;
      }
      if (mySeatIds.size >= MAX_SEATS_PER_BOOKING) {
         setNotice(`Mỗi đơn chỉ được chọn tối đa ${MAX_SEATS_PER_BOOKING} ghế.`);
         return;
      }
      setNotice(null);
      holdMutation.mutate(pickedShowtimeSeat.id);
   }

   function handleReplaceBooking(): void {
      if (conflictSeatId !== null) {
         replaceBookingMutation.mutate(conflictSeatId);
      }
   }

   function handleChangeShowtime(): void {
      if (mySeatIds.size === 0) {
         onChangeShowtime();
         return;
      }
      changeShowtimeMutation.mutate();
   }

   return (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
         <section className="space-y-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
               <button
                  type="button"
                  onClick={handleChangeShowtime}
                  disabled={isBusy}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 disabled:opacity-60"
               >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Đổi suất chiếu
               </button>
               <ConnectionBadge connectionState={connectionState} />
            </div>
            {notice && <Alert variant="info">{notice}</Alert>}
            {conflictSeatId !== null && (
               <Alert variant="error">
                  <span className="block">Đang có một đơn giữ ghế ở suất khác. Hủy đơn đó để chọn ghế ở suất này?</span>
                  <Button
                     size="sm"
                     className="mt-2"
                     isLoading={replaceBookingMutation.isPending}
                     onClick={handleReplaceBooking}
                  >
                     Hủy đơn cũ và tiếp tục
                  </Button>
               </Alert>
            )}
            {gridSeats.length === 0 ? (
               <p className="py-10 text-center text-sm text-ink-500">Phòng chiếu này chưa có sơ đồ ghế.</p>
            ) : (
               <SeatGrid
                  rows={getLayoutRowLetters(seatMap.rows)}
                  columns={seatMap.columns}
                  seats={gridSeats}
                  ariaLabel={`Sơ đồ ghế ${seatMap.hallName}`}
                  selectedSeatLabels={selectedSeatLabels}
                  onSeatPick={handleSeatPick}
                  showSeatLabels={false}
               />
            )}
            <SeatLegend
               seatTypes={seatTypesQuery.data ?? []}
               showMaintenance={seatMap.seats.some((showtimeSeat) => showtimeSeat.state === 'UNAVAILABLE')}
               bookingStates={['selected', 'held', 'sold']}
            />
         </section>

         <aside className="space-y-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-ink-100">
            <div className="space-y-1">
               <h2 className="text-lg font-extrabold uppercase leading-tight text-ink-900">{seatMap.movieTitle}</h2>
               <p className="text-sm text-ink-700">
                  {seatMap.hallName} · {seatMap.screenType}
               </p>
               <p className="text-sm text-ink-700">
                  {formatDisplayDate(toVietnamDate(seatMap.startTime))} ·{' '}
                  <span className="font-bold">{formatClockRange(seatMap.startTime, seatMap.endTime)}</span>
               </p>
            </div>
            {remainingSeconds !== null && (
               <p className="flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2 text-sm font-bold text-accent-700">
                  <Clock className="size-4" aria-hidden="true" />
                  Giữ ghế còn
                  <span className="rounded-md bg-white px-2 py-0.5 font-mono text-base">
                     {formatCountdown(remainingSeconds)}
                  </span>
               </p>
            )}
            <div className="space-y-2">
               <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-500">Ghế đã chọn</h3>
               {heldShowtimeSeats.length === 0 ? (
                  <p className="text-sm text-ink-500">Chọn ghế trên sơ đồ để thêm vào đơn.</p>
               ) : (
                  <ul className="divide-y divide-ink-100 text-sm">
                     {heldShowtimeSeats.map((showtimeSeat) => (
                        <li key={showtimeSeat.id} className="flex justify-between py-1.5">
                           <span className="font-bold text-ink-900">{getShowtimeSeatLabel(showtimeSeat)}</span>
                           <span className="text-ink-700">
                              {formatVnd(priceBySeatId.get(showtimeSeat.id) ?? showtimeSeat.price)}
                           </span>
                        </li>
                     ))}
                  </ul>
               )}
            </div>
            <p className="flex items-center justify-between border-t border-ink-200 pt-3 text-sm font-bold text-ink-900">
               <span>Tiền vé</span>
               <span className="text-xl font-extrabold text-brand-700">{formatVnd(totalAmount)}</span>
            </p>
            {orphanSeatMessage !== null && <Alert variant="error">{orphanSeatMessage}</Alert>}
            <Button
               fullWidth
               className="h-12 text-base"
               disabled={isBusy || heldShowtimeSeats.length === 0 || orphanSeatMessage !== null}
               onClick={onContinue}
            >
               Tiếp tục
            </Button>
         </aside>
      </div>
   );
}

export default SalesSeatStep;
