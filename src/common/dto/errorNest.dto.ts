import { ApiProperty } from '@nestjs/swagger';

export class ErrorNestDto {
  @ApiProperty({ example: 400, description: 'Код ошибки' })
  readonly statusCode: number;
  @ApiProperty()
  readonly message: string;
  @ApiProperty()
  readonly error: string;
}
