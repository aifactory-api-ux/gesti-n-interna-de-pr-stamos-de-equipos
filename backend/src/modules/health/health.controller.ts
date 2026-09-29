import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  getMetrics() {
    return {
      service: 'prestamo-equipos-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
