import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { StudentSubject } from './entities/student-subject.entity';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student, StudentSubject]), HistoryModule],
  providers: [StudentsService],
  controllers: [StudentsController]
})
export class StudentsModule { }
