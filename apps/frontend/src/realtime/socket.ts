import type { ClientEvents, ServerEvents } from '@stream-room/shared'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

export const socket: Socket<ServerEvents, ClientEvents> = io({
  transports: ['websocket'],
  autoConnect: false,
})
