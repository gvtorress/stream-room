export type HealthResponse = { status: 'ok' };

// Events sent by the server to clients.
export interface ServerEvents {
  pong: (message: string) => void;
}

// Events sent by clients to the server.
export interface ClientEvents {
  ping: () => void;
}
