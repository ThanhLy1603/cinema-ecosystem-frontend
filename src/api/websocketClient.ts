import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export class WebSocketClient {
   private client: Client | null = null

   public connect(onConnected?: () => void, onError?: (error: unknown) => void) {
      this.client = new Client({
         webSocketFactory: () => new SockJS('/ws'),
         reconnectDelay: 5000,
         heartbeatIncoming: 4000,
         heartbeatOutgoing: 4000,
         debug: (str) => {
            if (import.meta.env.DEV) {
               console.debug('[STOMP]', str)
            }
         },
         onConnect: () => {
            onConnected?.()
         },
         onStompError: (frame) => {
            console.error('[STOMP Error]', frame.headers['message'], frame.body)
            onError?.(frame)
         },
      })

      this.client.activate()
   }

   public subscribe(destination: string, callback: (message: IMessage) => void): StompSubscription | null {
      if (!this.client || !this.client.connected) {
         return null
      }
      return this.client.subscribe(destination, callback)
   }

   public publish(destination: string, body: unknown) {
      if (this.client && this.client.connected) {
         this.client.publish({
            destination,
            body: JSON.stringify(body),
         })
      }
   }

   public disconnect() {
      if (this.client) {
         this.client.deactivate()
         this.client = null
      }
   }

   public isConnected(): boolean {
      return Boolean(this.client?.connected)
   }
}

export const wsClient = new WebSocketClient()
export default wsClient
