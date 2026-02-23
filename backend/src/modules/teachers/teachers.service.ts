import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { SubjectAssignment } from './entities/subject-assignment.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { Class } from '../classes/entities/class.entity';
import { ClassTeacherHistory } from '../history/entities/class-teacher-history.entity';

@Injectable()
export class TeachersService {
    constructor(
        @InjectRepository(Teacher)
        private teachersRepository: Repository<Teacher>,
        @InjectRepository(SubjectAssignment)
        private subjectAssignmentRepository: Repository<SubjectAssignment>,
        @InjectRepository(Class)
        private classesRepository: Repository<Class>,
        @InjectRepository(ClassTeacherHistory)
        private classTeacherHistoryRepository: Repository<ClassTeacherHistory>,
    ) { }

    create(createTeacherDto: CreateTeacherDto) {
        const teacher = this.teachersRepository.create(createTeacherDto);
        return this.teachersRepository.save(teacher);
    }

    findAll() {
        return this.teachersRepository.find({ relations: ['classTeacherOf', 'classTeacherOf.class', 'subjectAssignments', 'subjectAssignments.subject', 'subjectAssignments.class', 'subjectAssignments.section'] });
    }



    async assignSubject(teacherId: number, dto: AssignSubjectDto) {
        // Deactivate existing active assignment for this subject/class/section
        await this.subjectAssignmentRepository.update(
            {
                subject: { id: dto.subjectId },
                class: { id: dto.classId },
                section: { id: dto.sectionId },
                isActive: true,
            },
            {
                isActive: false,
                endDate: new Date(),
            }
        );

        const assignment = this.subjectAssignmentRepository.create({
            teacher: { id: teacherId },
            subject: { id: dto.subjectId },
            class: { id: dto.classId },
            section: { id: dto.sectionId },
            isActive: true,
            startDate: new Date(),
        });
        return this.subjectAssignmentRepository.save(assignment);
    }

    async update(id: number, updateData: Partial<Teacher>) {
        await this.teachersRepository.update(id, updateData);
        return this.teachersRepository.findOne({ where: { id } });
    }

    async getHistory(teacherId: number) {
        const subjectHistory = await this.subjectAssignmentRepository.find({
            where: { teacher: { id: teacherId } },
            relations: ['subject', 'class', 'section'],
            order: { startDate: 'DESC' },
        });

        const classTeacherHistory = await this.classTeacherHistoryRepository.find({
            where: { teacher: { id: teacherId } },
            relations: ['section', 'section.class'],
            order: { startDate: 'DESC' },
        });

        return { subjectHistory, classTeacherHistory };
    }
}
