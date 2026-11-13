import { useEffect, useState } from 'react';

const TICK_MILLISECONDS: number = 1000;

export function useHoldCountdown(
   expiresAt: string | null,
   serverTime: string | null,
   receivedAtMilliseconds: number,
): number | null {
   const [nowMilliseconds, setNowMilliseconds] = useState<number>(() => Date.now());

   useEffect((): (() => void) | undefined => {
      if (expiresAt === null) {
         return undefined;
      }

      function handleTick(): void {
         setNowMilliseconds(Date.now());
      }

      const intervalId: number = window.setInterval(handleTick, TICK_MILLISECONDS);

      function handleCleanup(): void {
         window.clearInterval(intervalId);
      }

      return handleCleanup;
   }, [expiresAt]);

   if (expiresAt === null || serverTime === null) {
      return null;
   }
   const clockOffsetMilliseconds: number = Date.parse(serverTime) - receivedAtMilliseconds;
   const remainingMilliseconds: number = Date.parse(expiresAt) - (nowMilliseconds + clockOffsetMilliseconds);
   return Math.max(0, Math.ceil(remainingMilliseconds / TICK_MILLISECONDS));
}
