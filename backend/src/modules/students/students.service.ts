import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { StudentSubject } from './entities/student-subject.entity';
import { AcademicSession } from '../academic-sessions/entities/academic-session.entity';
import { StudentEnrollment, EnrollmentStatus } from '../student-enrollments/entities/student-enrollment.entity';
import { HistoryService } from '../history/history.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        @InjectRepository(StudentSubject)
        private studentSubjectRepository: Repository<StudentSubject>,
        @InjectRepository(AcademicSession)
        private sessionRepository: Repository<AcademicSession>,
        @InjectRepository(StudentEnrollment)
        private enrollmentRepository: Repository<StudentEnrollment>,
        private historyService: HistoryService,
    ) { }

    async create(createStudentDto: any) {
        let student = this.studentsRepository.create(createStudentDto) as unknown as Student;
        if (createStudentDto.discountIds && createStudentDto.discountIds.length > 0) {
            student.discounts = createStudentDto.discountIds.map((id: number) => ({ id } as any));
        }
        student = await this.studentsRepository.save(student);

        // Fetch specific academic session if provided, else use active one
        let targetSession: AcademicSession | null = null;
        if (createStudentDto.academicSessionId) {
            targetSession = await this.sessionRepository.findOne({ where: { id: createStudentDto.academicSessionId } });
        } else {
            targetSession = await this.sessionRepository.findOne({ where: { isActive: true } });
        }

        if (targetSession && student.class && student.section) {
            const enrollment = this.enrollmentRepository.create({
                student,
                class: student.class,
                section: student.section,
                academicSession: targetSession,
                status: EnrollmentStatus.ACTIVE
            });
            await this.enrollmentRepository.save(enrollment);
        }

        return student;
    }

    findAll() {
        return this.studentsRepository.find({ relations: ['studentSubjects', 'studentSubjects.extraSubject', 'class', 'section', 'discounts', 'enrollments', 'enrollments.academicSession', 'enrollments.class', 'enrollments.section'] });
    }

    findOne(id: number) {
        return this.studentsRepository.findOne({ where: { id }, relations: ['studentSubjects', 'studentSubjects.extraSubject', 'class', 'section', 'discounts', 'enrollments', 'enrollments.academicSession', 'enrollments.class', 'enrollments.section'] });
    }

    async enroll(studentId: number, classId: number, sectionId: number, extraSubjectIds: number[], academicSessionId?: number) {
        // Update student with class and section (legacy/cache link)
        await this.studentsRepository.update(studentId, {
            class: { id: classId },
            section: { id: sectionId },
        });

        // Ensure there is an active enrollment record for this class for the targeted session
        let targetSession: AcademicSession | null = null;
        if (academicSessionId) {
            targetSession = await this.sessionRepository.findOne({ where: { id: academicSessionId } });
        } else {
            targetSession = await this.sessionRepository.findOne({ where: { isActive: true } });
        }

        if (targetSession) {
            let enrollment = await this.enrollmentRepository.findOne({
                where: { student: { id: studentId }, academicSession: { id: targetSession.id } }
            });
            if (!enrollment) {
                enrollment = this.enrollmentRepository.create({
                    student: { id: studentId } as any,
                    academicSession: targetSession,
                    status: EnrollmentStatus.ACTIVE
                });
            }
            enrollment.class = { id: classId } as any;
            enrollment.section = { id: sectionId } as any;
            await this.enrollmentRepository.save(enrollment);
        }

        // Create student subject relations
        const existingSubjects = await this.studentSubjectRepository.find({
            where: { student: { id: studentId } },
            relations: ['extraSubject'],
        });

        const existingSubjectIds = new Set(existingSubjects.map((s) => s.extraSubject.id));

        // Identify subjects to remove
        const subjectsToRemove = existingSubjects.filter((s) => !extraSubjectIds.includes(s.extraSubject.id));
        if (subjectsToRemove.length > 0) {
            await this.studentSubjectRepository.remove(subjectsToRemove);
        }

        // Identify subjects to add
        const newSubjectIds = extraSubjectIds.filter((id) => !existingSubjectIds.has(id));

        const promises = newSubjectIds.map((subjectId) => {
            const studentSubject = this.studentSubjectRepository.create({
                student: { id: studentId },
                extraSubject: { id: subjectId },
            });
            return this.studentSubjectRepository.save(studentSubject);
        });

        return Promise.all(promises);
    }

    async promoteBulk(studentIds: number[], fromSessionId: number, toSessionId: number, targetClassId: number, targetSectionId: number) {
        const fromSession = await this.sessionRepository.findOne({ where: { id: fromSessionId } });
        const toSession = await this.sessionRepository.findOne({ where: { id: toSessionId } });

        if (!fromSession || !toSession) throw new Error('Invalid academic sessions provided');

        const results = { successful: 0, failed: 0, errors: [] as string[] };

        for (const studentId of studentIds) {
            try {
                const student = await this.studentsRepository.findOne({ where: { id: studentId } });
                if (!student) throw new Error(`Student ${studentId} not found`);

                // Find their enrollment in the FROM session
                const oldEnrollment = await this.enrollmentRepository.findOne({
                    where: { student: { id: studentId }, academicSession: { id: fromSessionId } }
                });

                if (oldEnrollment) {
                    oldEnrollment.status = EnrollmentStatus.PROMOTED;
                    await this.enrollmentRepository.save(oldEnrollment);
                }

                // Check if they already have an enrollment in the TO session
                let newEnrollment = await this.enrollmentRepository.findOne({
                    where: { student: { id: studentId }, academicSession: { id: toSessionId } }
                });

                if (!newEnrollment) {
                    newEnrollment = this.enrollmentRepository.create({
                        student: { id: studentId } as any,
                        academicSession: toSession,
                        class: { id: targetClassId } as any,
                        section: { id: targetSectionId } as any,
                        status: EnrollmentStatus.ACTIVE
                    });
                } else {
                    newEnrollment.class = { id: targetClassId } as any;
                    newEnrollment.section = { id: targetSectionId } as any;
                    newEnrollment.status = EnrollmentStatus.ACTIVE;
                }

                await this.enrollmentRepository.save(newEnrollment);

                // Update the master student record
                await this.studentsRepository.update(studentId, {
                    class: { id: targetClassId },
                    section: { id: targetSectionId },
                });

                results.successful++;
            } catch (err: any) {
                results.failed++;
                results.errors.push(`Student ${studentId}: ${err.message}`);
            }
        }

        return results;
    }

    async update(id: number, updateData: any) {
        const student = await this.studentsRepository.findOne({ where: { id }, relations: ['discounts'] });
        if (!student) throw new Error('Student not found');

        if (updateData.firstName !== undefined) student.firstName = updateData.firstName;
        if (updateData.lastName !== undefined) student.lastName = updateData.lastName;
        if (updateData.email !== undefined) student.email = updateData.email;
        if (updateData.isActive !== undefined) student.isActive = updateData.isActive;

        if (updateData.discountIds !== undefined) {
            student.discounts = updateData.discountIds.map((dId: number) => ({ id: dId }));
        }

        return this.studentsRepository.save(student);
    }
}
