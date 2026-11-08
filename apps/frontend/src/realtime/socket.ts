import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

interface ServerEvents {
  pong: (message: string) => void
}

interface ClientEvents {
  ping: () => void
}

export const socket: Socket<ServerEvents, ClientEvents> = io({
  transports: ['websocket'],
  autoConnect: false,
})
