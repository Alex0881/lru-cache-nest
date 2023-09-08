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
import { ErrorDto } from '../common/dto/errorDto';
import { GetValueKeyResponseDto } from './dto/getValueKeyResponse.dto';
import { SetValueKeyDto } from './dto/setValueKey.dto';
import { LruService } from './lru.service';
import { ValidationError } from 'class-validator';
import { ValidationException } from '../customExceptions/customExceptions';

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
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationException(errors),
    }),
  )
  @ApiOperation({ summary: 'Установка значения ключа' })
  @ApiResponse({ status: 200 })
  @ApiResponse({
    status: 422,
    description: 'Ошибка входных параметров',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка установки мьютекса или ошибка Redis',
    type: ErrorDto,
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
    status: 404,
    description: 'Ключ не существует',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Ошибка входных параметров',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка Redis',
    type: ErrorDto,
  })
  async getKeyValue(
    @Param('keyName') keyName: string,
  ): Promise<GetValueKeyResponseDto> {
    return await this.service.getKeyValue(keyName);
  }
}
