import { Client, type IFrame, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function logStompDebug(message: string): void {
   if (import.meta.env.DEV) {
      console.debug('[STOMP]', message);
   }
}

export class WebSocketClient {
   private client: Client | null = null;

   public connect(onConnected?: () => void, onError?: (error: unknown) => void): void {
      function handleStompError(frame: IFrame): void {
         console.error('[STOMP Error]', frame.headers['message'], frame.body);
         onError?.(frame);
      }

      this.client = new Client({
         webSocketFactory: () => new SockJS('/ws'),
         reconnectDelay: 5000,
         heartbeatIncoming: 4000,
         heartbeatOutgoing: 4000,
         debug: logStompDebug,
         onConnect: () => onConnected?.(),
         onStompError: handleStompError,
      });

      this.client.activate();
   }

   public subscribe(destination: string, callback: (message: IMessage) => void): StompSubscription | null {
      if (!this.client || !this.client.connected) {
         return null;
      }
      return this.client.subscribe(destination, callback);
   }

   public publish(destination: string, body: unknown): void {
      if (this.client && this.client.connected) {
         this.client.publish({
            destination,
            body: JSON.stringify(body),
         });
      }
   }

   public disconnect(): void {
      if (this.client) {
         this.client.deactivate();
         this.client = null;
      }
   }

   public isConnected(): boolean {
      return Boolean(this.client?.connected);
   }
}

export const webSocketClient: WebSocketClient = new WebSocketClient();
export default webSocketClient;
