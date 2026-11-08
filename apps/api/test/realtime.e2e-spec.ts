import type { ClientEvents, ServerEvents } from '@stream-room/shared';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module.js';

type TestSocket = Socket<ServerEvents, ClientEvents>;

describe('RealtimeGateway (e2e)', () => {
  let app: INestApplication<Server>;
  let url: string;
  let clients: TestSocket[];

  beforeEach(async () => {
    clients = [];
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    for (const client of clients) {
      client.disconnect();
    }
    await app.close();
  });

  async function connect(): Promise<TestSocket> {
    const client: TestSocket = io(url, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: false,
      timeout: 1000,
    });
    clients.push(client);

    await new Promise<void>((resolve, reject) => {
      client.once('connect', resolve);
      client.once('connect_error', reject);
      client.connect();
    });
    return client;
  }

  function ping(client: TestSocket): Promise<string> {
    return new Promise((resolve) => {
      client.once('pong', resolve);
      client.emit('ping');
    });
  }

  it('connects over WebSocket and responds to repeated pings with pong', async () => {
    const client = await connect();

    expect(client.connected).toBe(true);
    expect(client.io.engine.transport.name).toBe('websocket');
    await expect(ping(client)).resolves.toBe('pong');
    await expect(ping(client)).resolves.toBe('pong');
  });

  it('sends pong only to the client that sent ping', async () => {
    const sender = await connect();
    const other = await connect();
    const received: string[] = [];
    other.on('pong', (message) => received.push(message));

    await expect(ping(sender)).resolves.toBe('pong');
    // A reply to the second client confirms its earlier packets were delivered.
    await expect(ping(other)).resolves.toBe('pong');
    expect(received).toEqual(['pong']);
  });
});
