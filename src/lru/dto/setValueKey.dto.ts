import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetValueKeyDto {
  @IsString()
  @ApiProperty({ description: 'Устанавливаемое значение ключа' })
  value: string;
}