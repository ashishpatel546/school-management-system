import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { SubjectAssignment } from './entities/subject-assignment.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { Class } from '../classes/entities/class.entity';
import { ClassTeacherHistory } from '../history/entities/class-teacher-history.entity';
import { AcademicSession } from '../academic-sessions/entities/academic-session.entity';

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
        @InjectRepository(AcademicSession)
        private academicSessionRepository: Repository<AcademicSession>,
    ) { }

    async create(createTeacherDto: CreateTeacherDto) {
        // Auto-generate numeric employee code: find current max and increment
        const result = await this.teachersRepository
            .createQueryBuilder('teacher')
            .select('MAX(teacher.employeeCode)', 'maxCode')
            .getRawOne();
        const nextCode = result?.maxCode ? Number(result.maxCode) + 1 : 1001;

        const teacher = this.teachersRepository.create({
            user: {
                firstName: createTeacherDto.firstName,
                lastName: createTeacherDto.lastName,
                email: createTeacherDto.email || null,
                mobile: createTeacherDto.mobile,
                gender: createTeacherDto.gender,
                isActive: createTeacherDto.isActive !== undefined ? createTeacherDto.isActive : true,
                role: UserRole.TEACHER,
            } as any,
            // Teacher-specific fields
            employeeCode: nextCode,
            department: createTeacherDto.department,
            joiningDate: createTeacherDto.joiningDate,
            exitDate: createTeacherDto.exitDate,
            qualification: createTeacherDto.qualification,
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
            .leftJoinAndSelect('subjectAssignments.section', 'assignmentSection')
            .leftJoinAndSelect('subjectAssignments.academicSession', 'assignmentSession');

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
        // Resolve the academic session: use provided ID, or fall back to the currently active session
        let academicSessionId: number | null = null;
        if (dto.academicSessionId) {
            academicSessionId = dto.academicSessionId;
        } else {
            const activeSession = await this.academicSessionRepository.findOne({
                where: { isActive: true },
            });
            if (activeSession) {
                academicSessionId = activeSession.id;
            }
        }

        // Check if this teacher already has an active assignment for the same subject/class/section
        const existing = await this.subjectAssignmentRepository.findOne({
            where: {
                teacher: { id: teacherId },
                subject: { id: dto.subjectId },
                class: { id: dto.classId },
                section: { id: dto.sectionId },
                isActive: true,
            },
        });

        if (existing) {
            throw new ConflictException(
                'This subject is already assigned to this teacher for the selected class and section.',
            );
        }

        // Deactivate any existing active assignment for this subject/class/section from any other teacher
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
            ...(academicSessionId ? { academicSession: { id: academicSessionId } } : {}),
            isActive: true,
            startDate: new Date(),
        });
        return this.subjectAssignmentRepository.save(assignment);
    }

    async unassignSubject(assignmentId: number) {
        const assignment = await this.subjectAssignmentRepository.findOne({
            where: { id: assignmentId },
        });

        if (!assignment) {
            throw new NotFoundException('Subject assignment not found');
        }

        assignment.isActive = false;
        assignment.endDate = new Date();
        return this.subjectAssignmentRepository.save(assignment);
    }

    async update(id: number, updateData: any) {
        const teacher = await this.teachersRepository.findOne({ where: { id }, relations: ['user'] });
        if (!teacher) throw new NotFoundException('Teacher not found');

        if (!teacher.user) teacher.user = {} as any;

        // User fields
        if (updateData.firstName !== undefined) teacher.user.firstName = updateData.firstName;
        if (updateData.lastName !== undefined) teacher.user.lastName = updateData.lastName;
        if (updateData.email !== undefined) teacher.user.email = updateData.email || null;
        if (updateData.isActive !== undefined) teacher.user.isActive = updateData.isActive;
        if (updateData.mobile !== undefined) teacher.user.mobile = updateData.mobile;
        if (updateData.gender !== undefined) teacher.user.gender = updateData.gender;

        // Teacher-specific fields (employeeCode is auto-generated, never updated manually)
        if (updateData.department !== undefined) teacher.department = updateData.department;
        if (updateData.joiningDate !== undefined) teacher.joiningDate = updateData.joiningDate;
        if (updateData.exitDate !== undefined) teacher.exitDate = updateData.exitDate;
        if (updateData.qualification !== undefined) teacher.qualification = updateData.qualification;

        await this.teachersRepository.save(teacher);
        return this.teachersRepository.findOne({ where: { id }, relations: ['user'] });
    }

    async getHistory(teacherId: number) {
        const subjectHistory = await this.subjectAssignmentRepository.find({
            where: { teacher: { id: teacherId } },
            relations: ['subject', 'class', 'section', 'academicSession'],
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
