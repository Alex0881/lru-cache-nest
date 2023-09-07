import { Test, TestingModule } from '@nestjs/testing';
import { LruController } from './lru.controller';

describe('LruController', () => {
  let controller: LruController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LruController],
    }).compile();

    controller = module.get<LruController>(LruController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
