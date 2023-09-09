import { Test, TestingModule } from '@nestjs/testing';
import { LruService } from './lru.service';
import { ConfigService } from '@nestjs/config';
import { getRedisConnectionToken, RedisModule } from '@nestjs-modules/ioredis';

describe('LruService', () => {
  let service: LruService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LruService,
        ConfigService,
        {
          //provide: 'default_IORedisModuleConnectionToken',
          provide: getRedisConnectionToken(),
          //useValue: {}
          useValue: RedisModule,
          //  useValue: {
          //    get: () => 'any value',
          //    set: () => jest.fn(),
          //  },
        },
      ],
    }).compile();

    service = module.get<LruService>(LruService);
  });

  it('LruService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Method setKeyValue in LruService should be defined', () => {
    expect(service?.setKeyValue).toBeDefined();
  });

  it('Method getKeyValue in LruService should be defined', () => {
    expect(service?.getKeyValue).toBeDefined();
  });
});
