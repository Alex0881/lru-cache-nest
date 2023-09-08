import { Test, TestingModule } from '@nestjs/testing';
import { LruController } from './lru.controller';
import { LruService } from './lru.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

describe('LruController', () => {
  let controller: LruController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LruController],
      providers: [
        LruService,
        ConfigService,
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: RedisModule,
        },
      ],
      imports: [],
    }).compile();

    controller = module.get<LruController>(LruController);
  });

  it('LruController should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Method setKeyValue in LruController should be defined', () => {
    expect(controller?.setKeyValue).toBeDefined();
  });

  it('Method getKeyValue in LruController should be defined', () => {
    expect(controller?.getKeyValue).toBeDefined();
  });
});
