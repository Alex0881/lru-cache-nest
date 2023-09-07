import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErrorNestDto } from '../common/dto/errorNest.dto';
import { GetValueKeyResponseDto } from './dto/getValueKeyResponse.dto';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { SetValueKeyDto } from './dto/setValueKey.dto';
import { LruService } from './lru.service';

@ApiTags('LRU')
@Controller('')
export class LruController {
  constructor(private readonly service: LruService) {}
  @Version('1')
  @Post(':keyName')
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      disableErrorMessages: false,
      dismissDefaultMessages: false,
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @ApiOperation({ summary: 'Установка значения ключа' })
  @ApiResponse({ status: 200 })
  @ApiResponse({
    status: 422,
    description: 'Ошибка входных параметров',
    type: ErrorNestDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка установки мьютекса или ошибка Redis',
    type: ErrorNestDto,
  })
  async setKeyValue(
    @Body() dto: SetValueKeyDto,
    @Param('keyName') keyName: string,
  ) {
    await this.service.setKeyValue(keyName, dto);
  }

  @Version('1')
  @Get(':keyName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получение значения ключа' })
  @ApiResponse({ status: 200, type: GetValueKeyResponseDto })
  @ApiResponse({
    status: 422,
    description: 'Ошибка входных параметров',
    type: ErrorNestDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка Redis',
    type: ErrorNestDto,
  })
  async getKeyValue(
    @Param('keyName') keyName: string,
  ): Promise<GetValueKeyResponseDto> {
    return await this.service.getKeyValue(keyName);
  }
}
