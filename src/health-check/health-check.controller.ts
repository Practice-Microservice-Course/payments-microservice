import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealthCheckController {
  @Get()
  healthCheck(): string {
    return 'OK: Payments Microservice Webhook is up and running!';
  }
}
