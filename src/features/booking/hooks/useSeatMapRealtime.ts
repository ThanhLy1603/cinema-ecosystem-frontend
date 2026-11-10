import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { IMessage } from '@stomp/stompjs';
import { useEffect, useState } from 'react';
import { webSocketClient, type ConnectionState, type TopicSubscription } from '@/api/websocketClient';
import { showtimeSeatMapKey } from '@/lib/booking/bookingQueryKeys';
import { applySeatStatusMessage, parseSeatStatusMessage } from '@/lib/booking/seatStatusMessage';
import type { SeatStatusMessage, ShowtimeSeatMap } from '@/types/booking/seatMap';

export function useSeatMapRealtime(showtimeId: number | null): ConnectionState {
   const queryClient: QueryClient = useQueryClient();
   const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

   useEffect((): (() => void) | undefined => {
      if (showtimeId === null) {
         return undefined;
      }
      const queryKey: readonly (string | number)[] = showtimeSeatMapKey(showtimeId);

      function handleMessage(message: IMessage): void {
         const seatStatusMessage: SeatStatusMessage | null = parseSeatStatusMessage(message.body);
         if (seatStatusMessage === null || seatStatusMessage.showtimeId !== showtimeId) {
            return;
         }
         queryClient.setQueryData<ShowtimeSeatMap>(queryKey, (previousShowtimeSeatMap) =>
            previousShowtimeSeatMap === undefined
               ? previousShowtimeSeatMap
               : applySeatStatusMessage(previousShowtimeSeatMap, seatStatusMessage),
         );
      }

      function handleConnectionChange(nextConnectionState: ConnectionState): void {
         setConnectionState(nextConnectionState);
         if (nextConnectionState === 'connected') {
            void queryClient.invalidateQueries({ queryKey });
         }
      }

      const topicSubscription: TopicSubscription = webSocketClient.subscribe(
         `/topic/showtimes/${showtimeId}/seats`,
         handleMessage,
         handleConnectionChange,
      );

      function handleCleanup(): void {
         webSocketClient.unsubscribe(topicSubscription);
      }

      return handleCleanup;
   }, [showtimeId, queryClient]);

   return connectionState;
}
