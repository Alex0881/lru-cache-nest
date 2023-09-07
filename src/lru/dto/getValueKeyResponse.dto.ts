import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetValueKeyResponseDto {
  @IsString()
  @ApiProperty({ description: 'Значение' })
  value: string;
}