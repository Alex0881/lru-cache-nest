import { Test, TestingModule } from '@nestjs/testing';
import { LruService } from './lru.service';

describe('LruService', () => {
  let service: LruService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LruService],
    }).compile();

    service = module.get<LruService>(LruService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
