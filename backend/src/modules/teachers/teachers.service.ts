import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
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

    create(createTeacherDto: any) {
        const teacher = this.teachersRepository.create({
            user: {
                firstName: createTeacherDto.firstName,
                lastName: createTeacherDto.lastName,
                email: createTeacherDto.email || null,
                mobile: createTeacherDto.mobile,
                gender: createTeacherDto.gender,
                isActive: createTeacherDto.isActive !== undefined ? createTeacherDto.isActive : true,
                role: UserRole.TEACHER
            } as any
        });
        return this.teachersRepository.save(teacher);
    }

    async findAll(queryParams: any = {}) {
        const qb = this.teachersRepository.createQueryBuilder('teacher')
            .leftJoinAndSelect('teacher.user', 'user')
            .leftJoinAndSelect('teacher.classTeacherOf', 'classTeacherOf')
            .leftJoinAndSelect('classTeacherOf.class', 'class')
            .leftJoinAndSelect('teacher.subjectAssignments', 'subjectAssignments')
            .leftJoinAndSelect('subjectAssignments.subject', 'subject')
            .leftJoinAndSelect('subjectAssignments.class', 'assignmentClass')
            .leftJoinAndSelect('subjectAssignments.section', 'assignmentSection');

        if (queryParams.id) {
            qb.andWhere('teacher.id = :id', { id: queryParams.id });
        }
        if (queryParams.firstName) {
            qb.andWhere('LOWER(user.firstName) LIKE LOWER(:firstName)', { firstName: `%${queryParams.firstName}%` });
        }
        if (queryParams.lastName) {
            qb.andWhere('LOWER(user.lastName) LIKE LOWER(:lastName)', { lastName: `%${queryParams.lastName}%` });
        }
        if (queryParams.email) {
            qb.andWhere('LOWER(user.email) LIKE LOWER(:email)', { email: `%${queryParams.email}%` });
        }
        if (queryParams.isActive !== undefined && queryParams.isActive !== '') {
            qb.andWhere('user.isActive = :isActive', { isActive: queryParams.isActive === 'true' });
        }

        return qb.getMany();
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

    async update(id: number, updateData: any) {
        const teacher = await this.teachersRepository.findOne({ where: { id }, relations: ['user'] });
        if (!teacher) throw new NotFoundException('Teacher not found');

        if (!teacher.user) teacher.user = {} as any;

        if (updateData.firstName !== undefined) teacher.user.firstName = updateData.firstName;
        if (updateData.lastName !== undefined) teacher.user.lastName = updateData.lastName;
        if (updateData.email !== undefined) teacher.user.email = updateData.email || null;
        if (updateData.isActive !== undefined) teacher.user.isActive = updateData.isActive;
        if (updateData.mobile !== undefined) teacher.user.mobile = updateData.mobile;
        if (updateData.gender !== undefined) teacher.user.gender = updateData.gender;

        await this.teachersRepository.save(teacher);
        return this.teachersRepository.findOne({ where: { id }, relations: ['user'] });
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
