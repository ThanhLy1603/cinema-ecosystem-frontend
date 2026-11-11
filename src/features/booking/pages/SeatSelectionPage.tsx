import { useMutation, useQuery, useQueryClient, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { cancelPendingBooking, getMySeatHold, getShowtimeSeatMap, holdSeat, releaseSeat } from '@/api/bookingApi';
import type { ConnectionState } from '@/api/websocketClient';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import SeatGrid from '@/components/common/SeatGrid';
import SeatLegend from '@/components/common/SeatLegend';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { mySeatHoldKey, showtimeSeatMapKey } from '@/lib/booking/bookingQueryKeys';
import { MAX_SEATS_PER_BOOKING, compareShowtimeSeats, getShowtimeSeatLabel } from '@/lib/booking/seatLabels';
import { buildOrphanSeatMessage, findOrphanSeatLabels } from '@/lib/booking/seatGapRule';
import { applySeatStatusMessage } from '@/lib/booking/seatStatusMessage';
import { getLayoutRowLetters, type GridSeat } from '@/lib/cinema/seatMap';
import { useSeatTypes } from '@/lib/cinema/useSeatTypes';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import { getFnbSelectionPath, getSeatSelectionPath, getShowtimeSelectionPath } from '@/lib/booking/bookingPaths';
import { getMovieBookingPath } from '@/lib/movie/moviePath';
import { useBookingStore } from '@/stores/useBookingStore';
import type { SeatHold } from '@/types/booking/seatHold';
import type { SeatAvailability, ShowtimeSeat, ShowtimeSeatMap } from '@/types/booking/seatMap';
import type { SeatType } from '@/types/cinema/cinema';
import BookingStepper from '../components/BookingStepper';
import BookingSummaryAside, { type SummarySeat } from '../components/BookingSummaryAside';
import ConnectionBadge from '../components/ConnectionBadge';
import { useHoldCountdown } from '../hooks/useHoldCountdown';
import { useSeatMapRealtime } from '../hooks/useSeatMapRealtime';
import { buildDisplayedSeatIds, toGridSeat } from '../utils/seatSelection';
import { parsePositiveInteger } from '../utils/selectionParams';

const PENDING_OTHER_SHOWTIME_CODE: string = 'PENDING_BOOKING_OTHER_SHOWTIME';
const SEAT_ALREADY_HELD_CODE: string = 'SEAT_ALREADY_HELD';

const OCCUPIED_SEAT_NOTICES: Record<Exclude<SeatAvailability, 'AVAILABLE'>, string> = {
   HELD: 'Ghế đang được giữ bởi người khác.',
   SOLD: 'Ghế này đã được bán.',
   UNAVAILABLE: 'Ghế này đang bảo trì, không thể chọn.',
};

export function SeatSelectionPage(): ReactElement {
   const { movieSlug: movieSlugParam, showtimeId: showtimeIdParam } = useParams<{
      movieSlug: string;
      showtimeId: string;
   }>();
   const showtimeId: number | null = parsePositiveInteger(showtimeIdParam ?? null);
   const queryClient: QueryClient = useQueryClient();
   const selectShowtime: (showtimeId: number) => void = useBookingStore((bookingState) => bookingState.selectShowtime);
   const setNotice: (notice: string | null) => void = useBookingStore((bookingState) => bookingState.setNotice);
   const notice: string | null = useBookingStore((bookingState) => bookingState.notice);
   const [conflictSeatId, setConflictSeatId] = useState<number | null>(null);
   const seatTypesQuery: UseQueryResult<SeatType[]> = useSeatTypes();
   const seatMapQuery: UseQueryResult<ShowtimeSeatMap> = useQuery<ShowtimeSeatMap>({
      queryKey: showtimeSeatMapKey(showtimeId ?? 0),
      queryFn: () => getShowtimeSeatMap(showtimeId ?? 0),
      enabled: showtimeId !== null,
      retry: false,
   });
   const myHoldQuery: UseQueryResult<SeatHold> = useQuery<SeatHold>({
      queryKey: mySeatHoldKey(showtimeId ?? 0),
      queryFn: () => getMySeatHold(showtimeId ?? 0),
      enabled: showtimeId !== null,
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

   function applySeatChange(seatId: number, state: SeatAvailability): void {
      if (showtimeId === null) {
         return;
      }
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
      const errorCode: string | null = getErrorCode(error);
      if (errorCode === PENDING_OTHER_SHOWTIME_CODE) {
         setConflictSeatId(seatId);
         setNotice(null);
         return;
      }
      setNotice(errorCode === SEAT_ALREADY_HELD_CODE ? 'Ghế vừa có người chọn.' : getErrorMessage(error));
      void queryClient.invalidateQueries({ queryKey: showtimeSeatMapKey(showtimeId ?? 0) });
      void queryClient.invalidateQueries({ queryKey: mySeatHoldKey(showtimeId ?? 0) });
   }

   const holdMutation = useMutation<SeatHold, unknown, number>({
      mutationFn: (seatId: number) => holdSeat(showtimeId ?? 0, seatId),
      onSuccess(seatHold: SeatHold, seatId: number): void {
         queryClient.setQueryData<SeatHold>(mySeatHoldKey(showtimeId ?? 0), seatHold);
         applySeatChange(seatId, 'HELD');
         setNotice(null);
         setConflictSeatId(null);
      },
      onError: handleHoldFailure,
   });
   const releaseMutation = useMutation<SeatHold, unknown, number>({
      mutationFn: (seatId: number) => releaseSeat(showtimeId ?? 0, seatId),
      onSuccess(seatHold: SeatHold, seatId: number): void {
         queryClient.setQueryData<SeatHold>(mySeatHoldKey(showtimeId ?? 0), seatHold);
         applySeatChange(seatId, 'AVAILABLE');
         setNotice(null);
      },
      onError(error: unknown): void {
         setNotice(getErrorMessage(error));
      },
   });
   const replaceBookingMutation = useMutation<void, unknown, number>({
      mutationFn: async (seatId: number): Promise<void> => {
         await cancelPendingBooking();
         await holdSeat(showtimeId ?? 0, seatId);
      },
      onSuccess(): void {
         setConflictSeatId(null);
         void queryClient.invalidateQueries({ queryKey: mySeatHoldKey(showtimeId ?? 0) });
         void queryClient.invalidateQueries({ queryKey: showtimeSeatMapKey(showtimeId ?? 0) });
      },
      onError(error: unknown): void {
         setNotice(getErrorMessage(error));
      },
   });
   const isBusy: boolean = holdMutation.isPending || releaseMutation.isPending || replaceBookingMutation.isPending;
   const holdingSeatId: number | null = holdMutation.isPending ? holdMutation.variables : null;
   const releasingSeatId: number | null = releaseMutation.isPending ? releaseMutation.variables : null;
   const displayedSeatIds: Set<number> = useMemo(
      () => buildDisplayedSeatIds(mySeatIds, holdingSeatId, releasingSeatId),
      [mySeatIds, holdingSeatId, releasingSeatId],
   );

   useEffect((): void => {
      if (showtimeId !== null) {
         selectShowtime(showtimeId);
      }
   }, [showtimeId, selectShowtime]);

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

   useEffect((): void => {
      if (remainingSeconds === 0 && myHold?.expiresAt) {
         setNotice('Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế.');
         void queryClient.invalidateQueries({ queryKey: mySeatHoldKey(showtimeId ?? 0) });
         void queryClient.invalidateQueries({ queryKey: showtimeSeatMapKey(showtimeId ?? 0) });
      }
   }, [remainingSeconds, myHold, setNotice, queryClient, showtimeId]);

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
   const orphanSeatLabels: string[] = useMemo(
      (): string[] => findOrphanSeatLabels(showtimeSeatMap?.seats ?? [], displayedSeatIds),
      [showtimeSeatMap, displayedSeatIds],
   );
   const orphanSeatMessage: string | null =
      orphanSeatLabels.length > 0 ? buildOrphanSeatMessage(orphanSeatLabels) : null;
   const heldShowtimeSeats: ShowtimeSeat[] = useMemo(
      () =>
         (showtimeSeatMap?.seats ?? [])
            .filter((showtimeSeat) => displayedSeatIds.has(showtimeSeat.id))
            .sort(compareShowtimeSeats),
      [showtimeSeatMap, displayedSeatIds],
   );
   const selectedSeatLabels: Set<string> = new Set<string>(heldShowtimeSeats.map(getShowtimeSeatLabel));

   if (showtimeId === null) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">Đường dẫn suất chiếu không hợp lệ.</Alert>
            <Link to="/movies" className="text-sm font-semibold text-brand-700">
               Về danh sách phim
            </Link>
         </section>
      );
   }
   if (seatMapQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (seatMapQuery.isError || !showtimeSeatMap) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">{getErrorMessage(seatMapQuery.error)}</Alert>
            <Link to="/movies" className="text-sm font-semibold text-brand-700">
               Về danh sách phim
            </Link>
         </section>
      );
   }

   const seatMap: ShowtimeSeatMap = showtimeSeatMap;
   if (seatMap.movieSlug !== movieSlugParam) {
      return <Navigate to={getSeatSelectionPath(seatMap.movieSlug, seatMap.showtimeId)} replace />;
   }
   const priceBySeatId: Map<number, number> = new Map<number, number>(
      (myHold?.seats ?? []).map((heldSeat) => [heldSeat.seatId, heldSeat.price]),
   );
   const summarySeats: SummarySeat[] = heldShowtimeSeats.map((showtimeSeat) => ({
      id: showtimeSeat.id,
      label: getShowtimeSeatLabel(showtimeSeat),
      price: priceBySeatId.get(showtimeSeat.id) ?? showtimeSeat.price,
   }));

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
         setNotice(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS_PER_BOOKING} ghế cho mỗi lần đặt.`);
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

   return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-28 pt-8 sm:px-6 lg:px-12 lg:pb-8">
         <div className="space-y-4">
            <Link
               to={`${getMovieBookingPath(seatMap.movieSlug)}?showtime=${seatMap.showtimeId}`}
               className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Đổi suất chiếu
            </Link>
            <h1 className="text-2xl font-extrabold text-ink-900">Chọn ghế: {seatMap.movieTitle}</h1>
            <BookingStepper
               currentStepIndex={1}
               stepPaths={[getShowtimeSelectionPath(seatMap.movieSlug, seatMap.showtimeId)]}
            />
         </div>

         <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-xs sm:p-6">
               <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-ink-900">Sơ đồ ghế · {seatMap.hallName}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                     <ConnectionBadge connectionState={connectionState} />
                  </div>
               </div>
               {notice && <Alert variant="info">{notice}</Alert>}
               {orphanSeatMessage && <Alert variant="error">{orphanSeatMessage}</Alert>}
               {conflictSeatId !== null && (
                  <Alert variant="error">
                     <span className="block">
                        Bạn đang giữ ghế ở một suất chiếu khác. Hủy lượt giữ ghế đó để chọn ghế ở suất này?
                     </span>
                     <Button
                        size="sm"
                        className="mt-2"
                        isLoading={replaceBookingMutation.isPending}
                        onClick={handleReplaceBooking}
                     >
                        Hủy lượt giữ cũ và tiếp tục
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

            <BookingSummaryAside
               movieTitle={seatMap.movieTitle}
               posterUrl={seatMap.posterUrl}
               rated={seatMap.rated}
               durationMinutes={seatMap.durationMinutes}
               summaryShowtime={{
                  cinemaName: seatMap.cinemaName,
                  hallName: seatMap.hallName,
                  screenType: seatMap.screenType,
                  startTime: seatMap.startTime,
                  endTime: seatMap.endTime,
               }}
               priceFrom={null}
               summarySeats={summarySeats}
               actionLabel="Tiếp tục"
               actionTo={
                  summarySeats.length > 0 && orphanSeatMessage === null
                     ? getFnbSelectionPath(seatMap.movieSlug, seatMap.showtimeId)
                     : null
               }
               actionHint={
                  orphanSeatMessage === null
                     ? 'Ghế được giữ trong 10 phút kể từ lúc chọn ghế đầu tiên.'
                     : orphanSeatMessage
               }
               holdRemainingSeconds={remainingSeconds}
               collapsibleOnMobile
            />
         </div>
      </div>
   );
}

export default SeatSelectionPage;
