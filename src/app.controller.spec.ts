import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { getRedisConnectionToken, RedisModule } from '@nestjs-modules/ioredis';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          //provide: 'default_IORedisModuleConnectionToken',
          provide: getRedisConnectionToken(),
          useValue: RedisModule,
        },
      ],
      imports: [ConfigModule],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toEqual({
        message: 'This is LRU cache service.',
      });
    });
  });
});
