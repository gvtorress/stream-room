import type { ServerEvents } from '@stream-room/shared';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';

@WebSocketGateway({ transports: ['websocket'] })
export class RealtimeGateway {
  @SubscribeMessage('ping')
  handlePing(): WsResponse<Parameters<ServerEvents['pong']>[0]> {
    return { event: 'pong', data: 'pong' };
  }
}
