import { useMutation, useQuery, useQueryClient, type QueryClient, type UseQueryResult } from '@tanstack/react-query';
import { ArrowLeft, Timer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Link, Navigate, useNavigate, useParams, type NavigateFunction } from 'react-router-dom';
import { getMySeatHold, getPendingFnb, getShowtimeSeatMap, replacePendingFnb } from '@/api/bookingApi';
import { getPublicFnbMenu } from '@/api/fnbApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getFnbSelectionPath, getPaymentPath, getSeatSelectionPath } from '@/lib/booking/bookingPaths';
import { mySeatHoldKey, pendingFnbKey, showtimeSeatMapKey } from '@/lib/booking/bookingQueryKeys';
import {
   MAX_FNB_QUANTITY_PER_LINE,
   changeSelectionQuantity,
   findSelectionQuantity,
   keepOrderableSelectionLines,
   toBookingFnbRequest,
   toFnbSelectionLines,
} from '@/lib/booking/fnbSelection';
import { getErrorCode, getErrorMessage } from '@/lib/common/apiError';
import { FNB_CATEGORIES, FNB_CATEGORY_LABELS } from '@/lib/fnb/fnbLabels';
import { PUBLIC_FNB_KEY } from '@/lib/fnb/fnbQueryKeys';
import { useBookingStore } from '@/stores/useBookingStore';
import type { BookingFnb } from '@/types/booking/bookingFnb';
import type { FnbLineKind, FnbSelection, FnbSelectionLine } from '@/types/booking/fnbSelection';
import type { SeatHold } from '@/types/booking/seatHold';
import type { ShowtimeSeatMap } from '@/types/booking/seatMap';
import type { FnbCategory, FnbItem, FnbMenu } from '@/types/fnb/fnb';
import BookingStepper from '../components/BookingStepper';
import BookingSummaryAside, { type SummaryFnbLine, type SummarySeat } from '../components/BookingSummaryAside';
import FnbProductCard from '../components/FnbProductCard';
import { useHoldCountdown } from '../hooks/useHoldCountdown';
import { formatCountdown } from '../utils/seatSelection';
import { parsePositiveInteger } from '../utils/selectionParams';
import { buildSummaryFnbLines, buildSummarySeats } from '../utils/summaryLines';

const NO_PENDING_BOOKING_CODE: string = 'NO_PENDING_BOOKING';
const UNORDERABLE_PRODUCT_CODES: string[] = ['FNB_PRODUCT_UNAVAILABLE', 'FNB_PRODUCT_NOT_FOUND'];

export function FnbSelectionPage(): ReactElement {
   const { movieSlug: movieSlugParam, showtimeId: showtimeIdParam } = useParams<{
      movieSlug: string;
      showtimeId: string;
   }>();
   const showtimeId: number | null = parsePositiveInteger(showtimeIdParam ?? null);
   const navigate: NavigateFunction = useNavigate();
   const queryClient: QueryClient = useQueryClient();
   const selectShowtime: (showtimeId: number) => void = useBookingStore((bookingState) => bookingState.selectShowtime);
   const setNotice: (notice: string | null) => void = useBookingStore((bookingState) => bookingState.setNotice);
   const setFnbSelectionLines: (showtimeId: number, fnbSelectionLines: FnbSelectionLine[]) => void = useBookingStore(
      (bookingState) => bookingState.setFnbSelectionLines,
   );
   const [editedFnbSelectionLines, setEditedFnbSelectionLines] = useState<FnbSelectionLine[] | null>(null);
   const storedFnbSelection: FnbSelection | null = useBookingStore((bookingState) => bookingState.fnbSelection);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      refetchOnMount: 'always',
   });
   const menuQuery: UseQueryResult<FnbMenu> = useQuery<FnbMenu>({
      queryKey: PUBLIC_FNB_KEY,
      queryFn: getPublicFnbMenu,
      refetchOnMount: 'always',
   });
   const pendingFnbQuery: UseQueryResult<BookingFnb> = useQuery<BookingFnb>({
      queryKey: pendingFnbKey(),
      queryFn: getPendingFnb,
      refetchOnMount: 'always',
   });
   const showtimeSeatMap: ShowtimeSeatMap | undefined = seatMapQuery.data;
   const myHold: SeatHold | undefined = myHoldQuery.data;
   const fnbMenu: FnbMenu | undefined = menuQuery.data;
   const remainingSeconds: number | null = useHoldCountdown(
      myHold?.expiresAt ?? null,
      myHold?.serverTime ?? null,
      myHoldQuery.dataUpdatedAt,
   );

   const backToSeatSelection: (notice: string) => void = useCallback(
      function backToSeatSelection(notice: string): void {
         setNotice(notice);
         void queryClient.invalidateQueries({ queryKey: mySeatHoldKey(showtimeId ?? 0) });
         void queryClient.invalidateQueries({ queryKey: showtimeSeatMapKey(showtimeId ?? 0) });
         if (showtimeSeatMap) {
            navigate(getSeatSelectionPath(showtimeSeatMap.movieSlug, showtimeSeatMap.showtimeId), { replace: true });
         }
      },
      [setNotice, queryClient, showtimeId, showtimeSeatMap, navigate],
   );

   function handleSaveFailure(error: unknown): void {
      const errorCode: string | null = getErrorCode(error);
      if (errorCode === NO_PENDING_BOOKING_CODE) {
         backToSeatSelection('Bạn chưa giữ ghế hoặc đã hết thời gian giữ ghế. Vui lòng chọn lại ghế.');
         return;
      }
      if (errorCode !== null && UNORDERABLE_PRODUCT_CODES.includes(errorCode)) {
         void queryClient.invalidateQueries({ queryKey: PUBLIC_FNB_KEY });
      }
      setErrorMessage(getErrorMessage(error));
   }

   const saveMutation = useMutation<BookingFnb, unknown, FnbSelectionLine[]>({
      mutationFn: (savedFnbSelectionLines: FnbSelectionLine[]) =>
         replacePendingFnb(toBookingFnbRequest(savedFnbSelectionLines)),
      onSuccess(bookingFnb: BookingFnb): void {
         queryClient.setQueryData<BookingFnb>(pendingFnbKey(), bookingFnb);
         if (showtimeSeatMap) {
            navigate(getPaymentPath(showtimeSeatMap.movieSlug, showtimeSeatMap.showtimeId));
         }
      },
      onError: handleSaveFailure,
   });

   useEffect((): void => {
      if (showtimeId !== null) {
         selectShowtime(showtimeId);
      }
   }, [showtimeId, selectShowtime]);

   const isFnbReady: boolean = pendingFnbQuery.isSuccess && !pendingFnbQuery.isFetching;
   const fnbSelectionLines: FnbSelectionLine[] = useMemo((): FnbSelectionLine[] => {
      if (!fnbMenu || !isFnbReady) {
         return [];
      }
      const initialFnbSelectionLines: FnbSelectionLine[] =
         storedFnbSelection !== null && storedFnbSelection.showtimeId === showtimeId
            ? storedFnbSelection.lines
            : pendingFnbQuery.data
              ? toFnbSelectionLines(pendingFnbQuery.data)
              : [];
      return keepOrderableSelectionLines(editedFnbSelectionLines ?? initialFnbSelectionLines, fnbMenu);
   }, [fnbMenu, isFnbReady, storedFnbSelection, showtimeId, pendingFnbQuery.data, editedFnbSelectionLines]);

   useEffect((): void => {
      if (myHoldQuery.isSuccess && !myHoldQuery.isFetching && myHold && myHold.seats.length === 0) {
         backToSeatSelection('Bạn chưa giữ ghế nào hoặc đã hết thời gian giữ ghế. Vui lòng chọn ghế.');
      }
   }, [myHoldQuery.isSuccess, myHoldQuery.isFetching, myHold, backToSeatSelection]);

   useEffect((): void => {
      if (remainingSeconds === 0 && myHold?.expiresAt) {
         backToSeatSelection('Đã hết thời gian giữ ghế. Vui lòng chọn lại ghế.');
      }
   }, [remainingSeconds, myHold, backToSeatSelection]);

   const summarySeats: SummarySeat[] = useMemo(
      (): SummarySeat[] => buildSummarySeats(myHold, showtimeSeatMap),
      [myHold, showtimeSeatMap],
   );
   const summaryFnbLines: SummaryFnbLine[] = useMemo(
      (): SummaryFnbLine[] => buildSummaryFnbLines(fnbMenu, fnbSelectionLines),
      [fnbMenu, fnbSelectionLines],
   );

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
   if (seatMapQuery.isPending || myHoldQuery.isPending || menuQuery.isPending || pendingFnbQuery.isPending) {
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
   if (menuQuery.isError || !fnbMenu) {
      return (
         <section className="mx-auto w-full max-w-4xl space-y-4 px-4 py-12 sm:px-6">
            <Alert variant="error">{getErrorMessage(menuQuery.error)}</Alert>
            <Link
               to={getSeatSelectionPath(showtimeSeatMap.movieSlug, showtimeId)}
               className="text-sm font-semibold text-brand-700"
            >
               Quay lại chọn ghế
            </Link>
         </section>
      );
   }

   const seatMap: ShowtimeSeatMap = showtimeSeatMap;
   const menu: FnbMenu = fnbMenu;
   if (seatMap.movieSlug !== movieSlugParam) {
      return <Navigate to={getFnbSelectionPath(seatMap.movieSlug, seatMap.showtimeId)} replace />;
   }
   const currentFnbSelectionLines: FnbSelectionLine[] = fnbSelectionLines;
   const isReady: boolean = isFnbReady && summarySeats.length > 0;

   function handleQuantityChange(fnbLineKind: FnbLineKind, productId: number, quantity: number): void {
      const nextFnbSelectionLines: FnbSelectionLine[] = changeSelectionQuantity(
         currentFnbSelectionLines,
         fnbLineKind,
         productId,
         quantity,
      );
      setEditedFnbSelectionLines(nextFnbSelectionLines);
      setFnbSelectionLines(seatMap.showtimeId, nextFnbSelectionLines);
      setErrorMessage(null);
   }

   function handleContinue(): void {
      setErrorMessage(null);
      saveMutation.mutate(currentFnbSelectionLines);
   }

   function handleSkip(): void {
      setErrorMessage(null);
      setEditedFnbSelectionLines([]);
      setFnbSelectionLines(seatMap.showtimeId, []);
      saveMutation.mutate([]);
   }

   const itemsByCategory: Record<FnbCategory, FnbItem[]> = {
      POPCORN: menu.items.filter((fnbItem) => fnbItem.category === 'POPCORN'),
      DRINK: menu.items.filter((fnbItem) => fnbItem.category === 'DRINK'),
      SNACK: menu.items.filter((fnbItem) => fnbItem.category === 'SNACK'),
   };
   const isMenuEmpty: boolean = menu.combos.length === 0 && menu.items.length === 0;

   const footer: ReactElement = (
      <div className="space-y-2">
         <Button fullWidth disabled={!isReady} isLoading={saveMutation.isPending} onClick={handleContinue}>
            Tiếp tục
         </Button>
         <Button fullWidth variant="secondary" disabled={!isReady || saveMutation.isPending} onClick={handleSkip}>
            Bỏ qua
         </Button>
         <p className="text-center text-xs text-ink-500">Bắp nước là tùy chọn, bạn có thể bỏ qua bước này.</p>
      </div>
   );

   return (
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-12">
         <div className="space-y-4">
            <Link
               to={getSeatSelectionPath(seatMap.movieSlug, seatMap.showtimeId)}
               className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
               <ArrowLeft className="size-4" aria-hidden="true" />
               Quay lại chọn ghế
            </Link>
            <h1 className="text-2xl font-extrabold text-ink-900">Chọn bắp nước: {seatMap.movieTitle}</h1>
            <BookingStepper currentStepIndex={2} />
         </div>

         <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
               <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-600">Thêm bắp nước để nhận nhanh tại quầy, không cần xếp hàng lại.</p>
                  {remainingSeconds !== null && remainingSeconds > 0 && (
                     <span
                        className={
                           remainingSeconds <= 120
                              ? 'inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1 text-xs font-bold text-danger-800'
                              : 'inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700'
                        }
                     >
                        <Timer className="size-3.5" aria-hidden="true" />
                        Giữ ghế còn {formatCountdown(remainingSeconds)}
                     </span>
                  )}
               </div>
               {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
               {isMenuEmpty && (
                  <p className="rounded-2xl border border-ink-200 bg-white py-10 text-center text-sm text-ink-500">
                     Hiện chưa có bắp nước nào đang bán. Bạn có thể bỏ qua bước này.
                  </p>
               )}
               {menu.combos.length > 0 && (
                  <section aria-labelledby="fnb-combos-heading" className="space-y-3">
                     <h2 id="fnb-combos-heading" className="text-lg font-bold text-ink-900">
                        Combo tiết kiệm
                     </h2>
                     <div className="grid gap-4 sm:grid-cols-2">
                        {menu.combos.map((fnbCombo) => (
                           <FnbProductCard
                              key={fnbCombo.id}
                              name={fnbCombo.name}
                              description={fnbCombo.description}
                              detailLines={fnbCombo.items.map(
                                 (fnbComboItem) => `${fnbComboItem.quantity} × ${fnbComboItem.itemName}`,
                              )}
                              imageUrl={fnbCombo.imageUrl}
                              price={fnbCombo.price}
                              originalPrice={
                                 fnbCombo.itemsTotalPrice > fnbCombo.price ? fnbCombo.itemsTotalPrice : null
                              }
                              quantity={findSelectionQuantity(currentFnbSelectionLines, 'COMBO', fnbCombo.id)}
                              maxQuantity={MAX_FNB_QUANTITY_PER_LINE}
                              isDisabled={!isReady || saveMutation.isPending}
                              onQuantityChange={(quantity: number): void =>
                                 handleQuantityChange('COMBO', fnbCombo.id, quantity)
                              }
                           />
                        ))}
                     </div>
                  </section>
               )}
               {FNB_CATEGORIES.filter((fnbCategory) => itemsByCategory[fnbCategory].length > 0).map((fnbCategory) => (
                  <section key={fnbCategory} aria-label={FNB_CATEGORY_LABELS[fnbCategory]} className="space-y-3">
                     <h2 className="text-lg font-bold text-ink-900">{FNB_CATEGORY_LABELS[fnbCategory]}</h2>
                     <div className="grid gap-4 sm:grid-cols-2">
                        {itemsByCategory[fnbCategory].map((fnbItem) => (
                           <FnbProductCard
                              key={fnbItem.id}
                              name={fnbItem.name}
                              description={null}
                              detailLines={[]}
                              imageUrl={fnbItem.imageUrl}
                              price={fnbItem.price}
                              originalPrice={null}
                              quantity={findSelectionQuantity(currentFnbSelectionLines, 'ITEM', fnbItem.id)}
                              maxQuantity={MAX_FNB_QUANTITY_PER_LINE}
                              isDisabled={!isReady || saveMutation.isPending}
                              onQuantityChange={(quantity: number): void =>
                                 handleQuantityChange('ITEM', fnbItem.id, quantity)
                              }
                           />
                        ))}
                     </div>
                  </section>
               ))}
            </div>

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
               summaryFnbLines={summaryFnbLines}
               footer={footer}
            />
         </div>
      </div>
   );
}

export default FnbSelectionPage;
