import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './entities/student.entity';
import { StudentSubject } from './entities/student-subject.entity';
import { AcademicSession } from '../academic-sessions/entities/academic-session.entity';
import { StudentEnrollment } from '../student-enrollments/entities/student-enrollment.entity';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Student, StudentSubject, AcademicSession, StudentEnrollment]), HistoryModule],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule { }
