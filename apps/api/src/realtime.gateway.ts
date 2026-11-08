import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';

@WebSocketGateway({ transports: ['websocket'] })
export class RealtimeGateway {
  @SubscribeMessage('ping')
  handlePing(): WsResponse<string> {
    return { event: 'pong', data: 'pong' };
  }
}
