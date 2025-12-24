import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { StudentSubject } from './entities/student-subject.entity';
import { HistoryService } from '../history/history.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        @InjectRepository(StudentSubject)
        private studentSubjectRepository: Repository<StudentSubject>,
        private historyService: HistoryService,
    ) { }

    create(createStudentDto: CreateStudentDto) {
        const student = this.studentsRepository.create(createStudentDto);
        return this.studentsRepository.save(student);
    }

    findAll() {
        return this.studentsRepository.find({ relations: ['studentSubjects', 'studentSubjects.extraSubject', 'class', 'section'] });
    }

    findOne(id: number) {
        return this.studentsRepository.findOne({ where: { id }, relations: ['studentSubjects', 'studentSubjects.extraSubject', 'class', 'section'] });
    }

    async enroll(studentId: number, classId: number, sectionId: number, extraSubjectIds: number[]) {
        // Update student with class and section
        await this.studentsRepository.update(studentId, {
            class: { id: classId },
            section: { id: sectionId },
        });

        // Create student subject relations
        const promises = extraSubjectIds.map(subjectId => {
            const studentSubject = this.studentSubjectRepository.create({
                student: { id: studentId },
                extraSubject: { id: subjectId },
            });
            return this.studentSubjectRepository.save(studentSubject);
        });

        return Promise.all(promises);
    }

    async promote(id: number, classId: number, sectionId: number) {
        const student = await this.studentsRepository.findOne({ where: { id }, relations: ['class', 'section'] });

        if (!student) {
            throw new Error('Student not found');
        }

        if (student.class?.id === classId && student.section?.id === sectionId) {
            throw new Error('Student is already in this class and section');
        }

        await this.studentsRepository.update(id, {
            class: { id: classId },
            section: { id: sectionId },
        });

        if (student && student.class && student.section) {
            await this.historyService.logStudentEnrollment(student, student.class, student.section);
        }
        return this.studentsRepository.findOne({ where: { id }, relations: ['class', 'section'] });
    }

    async update(id: number, updateData: Partial<Student>) {
        await this.studentsRepository.update(id, updateData);
        return this.studentsRepository.findOne({ where: { id } });
    }
}
