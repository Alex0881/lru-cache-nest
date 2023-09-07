import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckDto } from './common/dto/healthCheck.dto';

@ApiTags('Health check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiResponse({
    status: 200,
    description: 'Для проверки health-check Docker',
    type: HealthCheckDto,
  })
  @Get()
  getHello(): HealthCheckDto {
    return { message: this.appService.getHello() };
  }
}
