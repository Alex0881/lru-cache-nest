import { HttpStatus } from '@nestjs/common';
import {
  KEY_CANT_BE_GETTED_ERROR_CODE,
  KEY_CANT_BE_SETTED_ERROR_CODE,
  KEY_NOT_EXIST_ERROR_CODE,
  MUTEX_CANT_BE_SETTED_ERROR_CODE,
  VALIDATION_ERROR_CODE,
} from '../common/constants/constants';
import { ValidationError } from 'class-validator';

export type TCustomExceptionKind =
  | 'authorization'
  | 'authentication'
  | 'not_found'
  | 'client'
  | 'server';
export abstract class CustomException {
  abstract exceptionKind: TCustomExceptionKind;

  protected name: string;
  public httpCode: number;
  constructor(
    public readonly errorCode: number,
    public readonly message: string,
    httpCode: number = undefined,
  ) {
    if (httpCode) {
      this.httpCode = httpCode;
    }
  }
}

// abstract class AuthenticationException extends CustomException {
//   readonly exceptionKind = 'authorization';
// }
//
// abstract class NotAllowedException extends CustomException {
//   readonly exceptionKind = 'authentication';
// }

abstract class NotFoundException extends CustomException {
  readonly exceptionKind = 'not_found';
}

abstract class ClientException extends CustomException {
  readonly exceptionKind = 'client';
}

abstract class ServerException extends CustomException {
  readonly exceptionKind = 'server';
}

export class ValidationException extends ClientException {
  constructor(
    errors: ValidationError[],
    httpCode = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super(
      VALIDATION_ERROR_CODE,
      'Validation failed! - ' +
        errors.reduce(
          (acc, elError) => acc + '; ' + elError.toString(false),
          '',
        ),
      httpCode,
    );
    this.name = ValidationException.name;
  }
}

export class MutexSettingException extends ServerException {
  constructor(key: string, httpCode = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(
      MUTEX_CANT_BE_SETTED_ERROR_CODE,
      `Mutex for key = ${key} was not setted, unable to set key ${key}`,
      httpCode,
    );

    this.name = MutexSettingException.name;
  }
}

export class KeySettingException extends ServerException {
  constructor(key: string, httpCode = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(
      KEY_CANT_BE_SETTED_ERROR_CODE,
      `Key = ${key} was not setted`,
      httpCode,
    );

    this.name = KeySettingException.name;
  }
}

export class KeyGettingException extends ServerException {
  constructor(key: string, httpCode = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(
      KEY_CANT_BE_GETTED_ERROR_CODE,
      `Key = ${key} was not getted`,
      httpCode,
    );

    this.name = KeyGettingException.name;
  }
}

export class KeyNotFoundException extends NotFoundException {
  constructor(key: string, httpCode = HttpStatus.NOT_FOUND) {
    super(KEY_NOT_EXIST_ERROR_CODE, `Key = ${key} is not exist`, httpCode);

    this.name = KeyNotFoundException.name;
  }
}
