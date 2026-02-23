import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicSessionsService } from './academic-sessions.service';
import { AcademicSessionsController } from './academic-sessions.controller';
import { AcademicSession } from './entities/academic-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicSession])],
  controllers: [AcademicSessionsController],
  providers: [AcademicSessionsService],
})
export class AcademicSessionsModule { }
