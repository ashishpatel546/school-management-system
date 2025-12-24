import { Test, TestingModule } from '@nestjs/testing';
import { ExtraSubjectsService } from './extra-subjects.service';

describe('ExtraSubjectsService', () => {
  let service: ExtraSubjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtraSubjectsService],
    }).compile();

    service = module.get<ExtraSubjectsService>(ExtraSubjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
