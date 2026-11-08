import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@stream-room/shared';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): HealthResponse {
    return { status: 'ok' };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
