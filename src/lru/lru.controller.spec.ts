import { Test, TestingModule } from '@nestjs/testing';
import { LruController } from './lru.controller';
import { LruService } from './lru.service';
import { getRedisConnectionToken, RedisModule } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

describe('LruController', () => {
  let controller: LruController;
  let service: LruService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LruController],
      providers: [
        //LruService,

        {
          provide: LruService,
          useValue: {
            setKeyValue: jest.fn().mockResolvedValue(undefined),
            getKeyValue: jest.fn().mockResolvedValue({ value: '123' }),
          },
        },

        ConfigService,
        {
          //provide: 'default_IORedisModuleConnectionToken',
          provide: getRedisConnectionToken(),
          useValue: RedisModule,
        },
      ],
      imports: [],
    }).compile();

    controller = module.get<LruController>(LruController);
    service = module.get<LruService>(LruService);
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

  describe('setKeyValue()', () => {
    it('should set key value', async () => {
      const createSpy = jest
        .spyOn(service, 'setKeyValue')
        .mockResolvedValueOnce(undefined);

      await controller.setKeyValue({ value: '123' }, 'key');
      expect(createSpy).toHaveBeenCalledWith('key', { value: '123' });
    });
  });

  describe('getKeyValue()', () => {
    it('should get key value', async () => {
      const createSpy = jest
        .spyOn(service, 'getKeyValue')
        .mockResolvedValueOnce({ value: '123' });

      await controller.getKeyValue('key');
      expect(createSpy).toHaveBeenCalledWith('key');
    });
  });
});
