import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RealtimeGateway } from './realtime.gateway.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RealtimeGateway],
})
export class AppModule {}
