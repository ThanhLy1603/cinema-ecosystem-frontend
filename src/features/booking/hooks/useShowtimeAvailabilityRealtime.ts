import { useEffect } from 'react';
import { webSocketClient, type ConnectionState, type TopicSubscription } from '@/api/websocketClient';

const REFRESH_DEBOUNCE_MILLISECONDS: number = 400;

export function useShowtimeAvailabilityRealtime(showtimeIds: number[], onAvailabilityChange: () => void): void {
   const showtimeIdsText: string = showtimeIds.join(',');

   useEffect((): (() => void) | undefined => {
      if (showtimeIdsText === '') {
         return undefined;
      }
      let timeoutId: number | null = null;

      function scheduleRefresh(): void {
         if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
         }
         timeoutId = window.setTimeout(onAvailabilityChange, REFRESH_DEBOUNCE_MILLISECONDS);
      }

      function handleConnectionChange(connectionState: ConnectionState): void {
         if (connectionState === 'connected') {
            scheduleRefresh();
         }
      }

      const topicSubscriptions: TopicSubscription[] = showtimeIdsText
         .split(',')
         .map((showtimeIdText) =>
            webSocketClient.subscribe(
               `/topic/showtimes/${showtimeIdText}/seats`,
               scheduleRefresh,
               handleConnectionChange,
            ),
         );

      function handleCleanup(): void {
         if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
         }
         topicSubscriptions.forEach((topicSubscription) => webSocketClient.unsubscribe(topicSubscription));
      }

      return handleCleanup;
   }, [showtimeIdsText, onAvailabilityChange]);
}
