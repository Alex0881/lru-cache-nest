import * as path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters';
import { LruService } from './lru/lru.service';
import { LruController } from './lru/lru.controller';
import * as Joi from '@hapi/joi';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_HOST: Joi.string().required(),
        APP_PREFIX: Joi.string().required(),
        MAX_CACHE_SIZE: Joi.number().required()
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          url: `redis://${configService.get('REDIS_HOST')}:${configService.get(
            'REDIS_PORT',
          )}`,
        },
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp:
        process.env.NODE_ENV === 'production'
          ? {
              redact: { paths: ['req'], remove: true }, // чтобы не логировать req
              transport: {
                target: 'pino/file',
                options: {
                  singleLine: true,
                  destination: path.join(
                    __dirname,
                    '..',
                    'logs',
                    'lru-cache-service.log',
                  ),
                  append: true,
                },
              },
              autoLogging: false,
            }
          : {
              redact: { paths: ['req'], remove: true }, // чтобы не логировать req
              transport: {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  //ignore: 'pid,hostname,req' // важно писать без пробелов
                },
              },
              autoLogging: false,
            },
    }),
  ],
  controllers: [AppController, LruController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    LruService,
  ],
})
export class AppModule {}
