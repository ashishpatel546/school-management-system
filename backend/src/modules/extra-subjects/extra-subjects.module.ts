import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtraSubjectsService } from './extra-subjects.service';
import { ExtraSubjectsController } from './extra-subjects.controller';
import { ExtraSubject } from './entities/extra-subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExtraSubject])],
  providers: [ExtraSubjectsService],
  controllers: [ExtraSubjectsController]
})
export class ExtraSubjectsModule { }
