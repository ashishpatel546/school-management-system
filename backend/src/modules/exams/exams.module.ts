import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { ExamCategory } from './entities/exam-category.entity';
import { ExamSetting } from './entities/exam-setting.entity';
import { StudentExamMarks } from './entities/student-exam-marks.entity';
import { Student } from '../students/entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import { Section } from '../classes/entities/section.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { AcademicSession } from '../academic-sessions/entities/academic-session.entity';
import { StudentEnrollment } from '../student-enrollments/entities/student-enrollment.entity';
import { GradingSystem } from './entities/grading-system.entity';

import { StudentsModule } from '../students/students.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ExamCategory,
            ExamSetting,
            StudentExamMarks,
            Student,
            Class,
            Section,
            Subject,
            AcademicSession,
            StudentEnrollment,
            GradingSystem,
        ]),
        StudentsModule,
    ],
    controllers: [ExamsController],
    providers: [ExamsService],
    exports: [ExamsService],
})
export class ExamsModule { }
