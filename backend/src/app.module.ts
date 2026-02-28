import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './common/config/env.validation';
import { StudentsModule } from './modules/students/students.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HistoryModule } from './modules/history/history.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FeesModule } from './modules/fees/fees.module';
import { AcademicSessionsModule } from './modules/academic-sessions/academic-sessions.module';
import { StudentEnrollmentsModule } from './modules/student-enrollments/student-enrollments.module';
import { Student } from './modules/students/entities/student.entity';
import { AcademicSession } from './modules/academic-sessions/entities/academic-session.entity';
import { StudentEnrollment } from './modules/student-enrollments/entities/student-enrollment.entity';
import { ExamsModule } from './modules/exams/exams.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Student, AcademicSession, StudentEnrollment]),
    StudentsModule,
    SubjectsModule,
    UsersModule,
    ClassesModule,
    TeachersModule,
    DashboardModule,
    HistoryModule,
    AttendanceModule,
    FeesModule,
    AcademicSessionsModule,
    StudentEnrollmentsModule,
    ExamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
