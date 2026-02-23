import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEnrollmentHistory } from './entities/student-enrollment-history.entity';
import { ClassTeacherHistory } from './entities/class-teacher-history.entity';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Class } from '../classes/entities/class.entity';
import { Section } from '../classes/entities/section.entity';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(StudentEnrollmentHistory)
        private studentHistoryRepo: Repository<StudentEnrollmentHistory>,
        @InjectRepository(ClassTeacherHistory)
        private classTeacherHistoryRepo: Repository<ClassTeacherHistory>,
    ) { }

    async logStudentEnrollment(student: Student, cls: Class, section: Section) {
        // Deactivate previous active records
        await this.studentHistoryRepo.update(
            { student: { id: student.id }, isActive: true },
            { isActive: false, endDate: new Date() }
        );

        // Create new record
        const history = this.studentHistoryRepo.create({
            student,
            class: cls,
            section,
            startDate: new Date(),
            isActive: true,
        });
        return this.studentHistoryRepo.save(history);
    }

    async logSectionTeacherAssignment(teacher: Teacher, section: Section) {
        // Deactivate previous active records for this section
        await this.classTeacherHistoryRepo.update(
            { section: { id: section.id }, isActive: true },
            { isActive: false, endDate: new Date() }
        );

        const history = this.classTeacherHistoryRepo.create({
            teacher,
            section: section,
            startDate: new Date(),
            isActive: true,
        });
        return this.classTeacherHistoryRepo.save(history);
    }
}
