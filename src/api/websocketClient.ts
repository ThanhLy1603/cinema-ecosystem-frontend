import { Client, type IFrame, type IMessage, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type ConnectionState = 'connecting' | 'connected' | 'reconnecting';

export interface TopicSubscription {
   destination: string;
   onMessage: (message: IMessage) => void;
   onConnectionChange: (connectionState: ConnectionState) => void;
   stompSubscription: StompSubscription | null;
}

const WEBSOCKET_ENDPOINT: string = '/ws/cinema';
const RECONNECT_DELAY_MILLISECONDS: number = 3000;
const HEARTBEAT_MILLISECONDS: number = 10000;

function logStompDebug(message: string): void {
   if (import.meta.env.DEV) {
      console.debug('[STOMP]', message);
   }
}

export class WebSocketClient {
   private client: Client | null = null;
   private topicSubscriptions: Set<TopicSubscription> = new Set<TopicSubscription>();
   private hasConnectedBefore: boolean = false;

   public subscribe(
      destination: string,
      onMessage: (message: IMessage) => void,
      onConnectionChange: (connectionState: ConnectionState) => void,
   ): TopicSubscription {
      const topicSubscription: TopicSubscription = {
         destination,
         onMessage,
         onConnectionChange,
         stompSubscription: null,
      };
      this.topicSubscriptions.add(topicSubscription);
      if (this.client === null) {
         onConnectionChange('connecting');
         this.activate();
      } else if (this.client.connected) {
         this.attach(topicSubscription);
         onConnectionChange('connected');
      } else {
         onConnectionChange(this.hasConnectedBefore ? 'reconnecting' : 'connecting');
      }
      return topicSubscription;
   }

   public unsubscribe(topicSubscription: TopicSubscription): void {
      this.topicSubscriptions.delete(topicSubscription);
      topicSubscription.stompSubscription?.unsubscribe();
      topicSubscription.stompSubscription = null;
      if (this.topicSubscriptions.size === 0 && this.client !== null) {
         const client: Client = this.client;
         this.client = null;
         this.hasConnectedBefore = false;
         void client.deactivate();
      }
   }

   public isConnected(): boolean {
      return Boolean(this.client?.connected);
   }

   private activate(): void {
      const client: Client = new Client({
         webSocketFactory: () => new SockJS(WEBSOCKET_ENDPOINT),
         reconnectDelay: RECONNECT_DELAY_MILLISECONDS,
         heartbeatIncoming: HEARTBEAT_MILLISECONDS,
         heartbeatOutgoing: HEARTBEAT_MILLISECONDS,
         debug: logStompDebug,
         onConnect: (): void => this.handleConnect(client),
         onWebSocketClose: (): void => this.handleDisconnect(client),
         onStompError: (frame: IFrame): void => console.error('[STOMP Error]', frame.headers['message'], frame.body),
      });
      this.client = client;
      client.activate();
   }

   private handleConnect(connectedClient: Client): void {
      if (this.client !== connectedClient) {
         return;
      }
      this.hasConnectedBefore = true;
      this.topicSubscriptions.forEach((topicSubscription): void => {
         this.attach(topicSubscription);
         topicSubscription.onConnectionChange('connected');
      });
   }

   private handleDisconnect(closedClient: Client): void {
      if (this.client !== closedClient) {
         return;
      }
      this.topicSubscriptions.forEach((topicSubscription): void => {
         topicSubscription.stompSubscription = null;
         topicSubscription.onConnectionChange('reconnecting');
      });
   }

   private attach(topicSubscription: TopicSubscription): void {
      if (this.client === null || !this.client.connected) {
         return;
      }
      topicSubscription.stompSubscription = this.client.subscribe(
         topicSubscription.destination,
         topicSubscription.onMessage,
      );
   }
}

export const webSocketClient: WebSocketClient = new WebSocketClient();
export default webSocketClient;
