import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CustomException,
  TCustomExceptionKind,
} from '../../customExceptions/customExceptions';
import { PinoLogger } from 'nestjs-pino';

const exceptionKindsMap = new Map<TCustomExceptionKind, number>()
  .set('authentication', 401)
  .set('authorization', 403)
  .set('not_found', 404)
  .set('client', 400)
  .set('server', 500);

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: T, host: ArgumentsHost) {
    this.logger.error(exception);

    const hostType = host.getType();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception instanceof CustomException) {
      status = exception.httpCode
        ? exception.httpCode
        : exceptionKindsMap.get(exception.exceptionKind);
    }

    if (hostType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      const result = this.makeHttpResponse(status, request, exception);
      this.logger.error(result);
      response.status(status).json(result);
    } else {
      // здесь надо что-то другое написать если будут контроллеры grpc или graphql
      return this.makeHttpResponse(status, undefined, exception);
    }
  }

  private makeHttpResponse(status: number, request: Request, exception: any) {
    return {
      statusCode: status,
      errorCode: exception['errorCode'],
      timestamp: new Date().toISOString(),
      path: request?.url,
      method: request?.method,
      exception: {
        name: exception['name'],
        message: exception['message'],
      },
    };
  }
}
