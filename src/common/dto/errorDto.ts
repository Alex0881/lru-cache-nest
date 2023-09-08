import { ApiProperty } from '@nestjs/swagger';

class ExceptionDto {
  @ApiProperty()
  readonly name: string;
  @ApiProperty()
  readonly message: string;
}
export class ErrorDto {
  @ApiProperty({ example: 404, description: 'Код ошибки' })
  readonly statusCode: number;
  @ApiProperty({ example: 40401, description: 'Субкод ошибки' })
  readonly errorCode: number;
  @ApiProperty({
    example: '2023-09-08T07:51:20.328Z',
    description: 'Время ошибки',
  })
  readonly timestamp: string;
  @ApiProperty({ example: '/v1/superkey4', description: 'Роут ошибки' })
  readonly path: string;
  @ApiProperty({ example: 'POST', description: 'Глагол REST' })
  readonly method: string;
  @ApiProperty({ type: () => ExceptionDto })
  readonly exception: ExceptionDto;
}
