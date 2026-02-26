import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { Teacher } from './entities/teacher.entity';
import { SubjectAssignment } from './entities/subject-assignment.entity';
import { Class } from '../classes/entities/class.entity';
import { ClassTeacherHistory } from '../history/entities/class-teacher-history.entity';
import { AcademicSession } from '../academic-sessions/entities/academic-session.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Teacher, SubjectAssignment, Class, ClassTeacherHistory, AcademicSession])],
    controllers: [TeachersController],
    providers: [TeachersService],
    exports: [TeachersService],
})
export class TeachersModule { }
