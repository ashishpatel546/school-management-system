import { Test, TestingModule } from '@nestjs/testing';
import { ExtraSubjectsController } from './extra-subjects.controller';

describe('ExtraSubjectsController', () => {
  let controller: ExtraSubjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtraSubjectsController],
    }).compile();

    controller = module.get<ExtraSubjectsController>(ExtraSubjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
