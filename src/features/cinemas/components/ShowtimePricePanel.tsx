import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { getPublicShowtimePrice } from '@/api/showtime/pricingApi';
import ShowtimePriceTable from '@/components/common/ShowtimePriceTable';
import Alert from '@/components/ui/Alert';
import { getErrorMessage } from '@/lib/common/apiError';
import { publicShowtimePriceKey } from '@/lib/showtime/showtimeQueryKeys';
import type { ShowtimePrice } from '@/types/showtime/pricing';

interface ShowtimePricePanelProps {
   showtimeId: number;
   title: string;
}

export function ShowtimePricePanel({ showtimeId, title }: ShowtimePricePanelProps): ReactElement {
   const priceQuery: UseQueryResult<ShowtimePrice> = useQuery<ShowtimePrice>({
      queryKey: publicShowtimePriceKey(showtimeId),
      queryFn: () => getPublicShowtimePrice(showtimeId),
   });

   return (
      <div className="space-y-3 rounded-xl bg-ink-50 p-4 ring-1 ring-ink-100">
         <h4 className="text-sm font-extrabold text-ink-900">Bảng giá vé · {title}</h4>
         {priceQuery.isPending && <p className="text-sm text-ink-500">Đang tính giá vé...</p>}
         {priceQuery.isError && <Alert variant="error">{getErrorMessage(priceQuery.error)}</Alert>}
         {priceQuery.data && <ShowtimePriceTable showtimePrice={priceQuery.data} />}
      </div>
   );
}

export default ShowtimePricePanel;
