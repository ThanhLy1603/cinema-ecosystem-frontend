import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Ticket } from 'lucide-react';
import type { ReactElement } from 'react';
import { getMyBookings } from '@/api/bookingApi';
import FullPageSpinner from '@/components/common/FullPageSpinner';
import Alert from '@/components/ui/Alert';
import LinkButton from '@/components/ui/LinkButton';
import { myBookingsKey } from '@/lib/booking/bookingQueryKeys';
import { getErrorMessage } from '@/lib/common/apiError';
import type { BookingDetail } from '@/types/booking/bookingDetail';
import BookingInvoiceCard from '../components/BookingInvoiceCard';

export function MyTicketsPage(): ReactElement {
   const myBookingsQuery: UseQueryResult<BookingDetail[]> = useQuery<BookingDetail[]>({
      queryKey: myBookingsKey(),
      queryFn: getMyBookings,
      refetchOnMount: 'always',
   });

   if (myBookingsQuery.isPending) {
      return <FullPageSpinner />;
   }
   if (myBookingsQuery.isError) {
      return (
         <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
            <Alert variant="error">{getErrorMessage(myBookingsQuery.error)}</Alert>
         </section>
      );
   }

   const bookingDetails: BookingDetail[] = myBookingsQuery.data;

   return (
      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
         <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-ink-900">Vé của tôi</h1>
            <p className="text-sm text-ink-600">Hóa đơn và vé điện tử của các đơn đã thanh toán.</p>
         </div>
         {bookingDetails.length === 0 ? (
            <div className="grid place-items-center gap-4 rounded-2xl border border-ink-200 bg-white px-6 py-16 text-center">
               <Ticket className="size-12 text-brand-300" aria-hidden="true" />
               <p className="text-ink-600">Bạn chưa có vé nào.</p>
               <LinkButton to="/movies">Khám phá phim</LinkButton>
            </div>
         ) : (
            <div className="space-y-5">
               {bookingDetails.map((bookingDetail) => (
                  <BookingInvoiceCard key={bookingDetail.bookingId} bookingDetail={bookingDetail} />
               ))}
            </div>
         )}
      </section>
   );
}

export default MyTicketsPage;
