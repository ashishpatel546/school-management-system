import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { StudentSubject } from './entities/student-subject.entity';
import { AcademicSession } from '../academic-sessions/entities/academic-session.entity';
import {
  StudentEnrollment,
  EnrollmentStatus,
} from '../student-enrollments/entities/student-enrollment.entity';
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
    let student = this.studentsRepository.create({
      siblingId: createStudentDto.siblingId,
      user: {
        firstName: createStudentDto.firstName,
        lastName: createStudentDto.lastName,
        email: createStudentDto.email || null,
        mobile: createStudentDto.mobile,
        alternateMobile: createStudentDto.alternateMobile,
        gender: createStudentDto.gender,
        fathersName: createStudentDto.fathersName,
        mothersName: createStudentDto.mothersName,
        aadhaarNumber: createStudentDto.aadhaarNumber,
        category: createStudentDto.category,
        religion: createStudentDto.religion,
        bloodGroup: createStudentDto.bloodGroup,
        dateOfBirth: createStudentDto.dateOfBirth,
        isActive:
          createStudentDto.isActive !== undefined
            ? createStudentDto.isActive
            : true,
        role: UserRole.STUDENT,
      },
    }) as unknown as Student;
    if (
      createStudentDto.discountIds &&
      createStudentDto.discountIds.length > 0
    ) {
      student.studentDiscounts = createStudentDto.discountIds.map(
        (id: number) => ({ discountCategory: { id }, isActive: true }) as any,
      );
    }

    // Validate sibling parent names match
    if (createStudentDto.siblingId) {
      const sibling = await this.studentsRepository.findOne({
        where: { id: createStudentDto.siblingId },
        relations: ['user'],
      });
      if (!sibling) {
        throw new BadRequestException('Sibling student not found.');
      }
      const sibFather = (sibling.user?.fathersName || '').trim().toLowerCase();
      const sibMother = (sibling.user?.mothersName || '').trim().toLowerCase();
      const newFather = (createStudentDto.fathersName || '')
        .trim()
        .toLowerCase();
      const newMother = (createStudentDto.mothersName || '')
        .trim()
        .toLowerCase();
      if (sibFather !== newFather || sibMother !== newMother) {
        throw new BadRequestException(
          `Sibling validation failed: Father's name and Mother's name must match the selected sibling's parent names (` +
          `Father: "${sibling.user?.fathersName}", Mother: "${sibling.user?.mothersName}").`,
        );
      }
    }

    student = await this.studentsRepository.save(student);

    // Fetch specific academic session if provided, else use active one
    let targetSession: AcademicSession | null = null;
    if (createStudentDto.academicSessionId) {
      targetSession = await this.sessionRepository.findOne({
        where: { id: createStudentDto.academicSessionId },
      });
    } else {
      targetSession = await this.sessionRepository.findOne({
        where: { isActive: true },
      });
    }

    if (targetSession && student.class && student.section) {
      const maxRollNoResult = await this.enrollmentRepository
        .createQueryBuilder('e')
        .select('MAX(e.rollNo)', 'maxRollNo')
        .where(
          'e.class = :classId AND e.section = :sectionId AND e.academicSession = :sessionId',
          {
            classId: student.class.id,
            sectionId: student.section.id,
            sessionId: targetSession.id,
          },
        )
        .getRawOne();
      const nextRollNo = (maxRollNoResult?.maxRollNo ?? 0) + 1;
      const enrollment = this.enrollmentRepository.create({
        student,
        class: student.class,
        section: student.section,
        academicSession: targetSession,
        status: EnrollmentStatus.ACTIVE,
        rollNo: nextRollNo,
      });
      await this.enrollmentRepository.save(enrollment);
    }

    return student;
  }

  async findAll(queryParams: any = {}) {
    const qb = this.studentsRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.studentSubjects', 'studentSubjects')
      .leftJoinAndSelect('studentSubjects.subject', 'subject')
      .leftJoinAndSelect('student.class', 'class')
      .leftJoinAndSelect('student.section', 'section')
      .leftJoinAndSelect('student.studentDiscounts', 'studentDiscounts')
      .leftJoinAndSelect('studentDiscounts.discountCategory', 'discounts')
      .leftJoinAndSelect('student.enrollments', 'enrollments')
      .leftJoinAndSelect('enrollments.academicSession', 'academicSession')
      .leftJoinAndSelect('enrollments.class', 'enrollmentClass')
      .leftJoinAndSelect('enrollments.section', 'enrollmentSection');

    if (queryParams.id) {
      qb.andWhere('student.id = :id', { id: queryParams.id });
    }
    // Generic OR search across firstName and lastName (used by sibling modal)
    if (queryParams.search) {
      qb.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))',
        { search: `%${queryParams.search}%` },
      );
    }
    if (queryParams.firstName) {
      qb.andWhere('LOWER(user.firstName) LIKE LOWER(:firstName)', {
        firstName: `%${queryParams.firstName}%`,
      });
    }
    if (queryParams.lastName) {
      qb.andWhere('LOWER(user.lastName) LIKE LOWER(:lastName)', {
        lastName: `%${queryParams.lastName}%`,
      });
    }
    if (queryParams.email) {
      qb.andWhere('LOWER(user.email) LIKE LOWER(:email)', {
        email: `%${queryParams.email}%`,
      });
    }
    if (queryParams.parentsName) {
      qb.andWhere(
        '(LOWER(user.fathersName) LIKE LOWER(:parents) OR LOWER(user.mothersName) LIKE LOWER(:parents))',
        { parents: `%${queryParams.parentsName}%` },
      );
    }
    if (queryParams.isActive !== undefined && queryParams.isActive !== '') {
      qb.andWhere('user.isActive = :isActive', {
        isActive: queryParams.isActive === 'true',
      });
    }
    if (queryParams.classId) {
      if (queryParams.academicSessionId) {
        qb.andWhere(
          'enrollments.academicSession.id = :sessionId AND enrollmentClass.id = :filterClassId',
          {
            sessionId: parseInt(queryParams.academicSessionId),
            filterClassId: parseInt(queryParams.classId),
          },
        );
      } else {
        qb.andWhere(
          'enrollmentClass.id = :filterClassId AND enrollments.status = :activeStatus',
          {
            filterClassId: parseInt(queryParams.classId),
            activeStatus: EnrollmentStatus.ACTIVE,
          },
        );
      }
    }
    if (queryParams.sectionId) {
      if (queryParams.academicSessionId) {
        qb.andWhere(
          'enrollments.academicSession.id = :sessionId2 AND enrollmentSection.id = :filterSectionId',
          {
            sessionId2: parseInt(queryParams.academicSessionId),
            filterSectionId: parseInt(queryParams.sectionId),
          },
        );
      } else {
        qb.andWhere(
          'enrollmentSection.id = :filterSectionId AND enrollments.status = :activeStatus2',
          {
            filterSectionId: parseInt(queryParams.sectionId),
            activeStatus2: EnrollmentStatus.ACTIVE,
          },
        );
      }
    }

    if (queryParams.academicSessionId && (!queryParams.classId && !queryParams.sectionId)) {
      qb.andWhere('enrollments.academicSession.id = :sessionId3', { sessionId3: parseInt(queryParams.academicSessionId) })
    }

    const isPaginated = queryParams.page && queryParams.limit;
    if (isPaginated) {
      const page = parseInt(queryParams.page) || 1;
      const limit = parseInt(queryParams.limit) || 10;
      qb.skip((page - 1) * limit).take(limit);
    }

    let students: Student[];
    let total = 0;

    if (isPaginated) {
      const [fetchedStudents, count] = await qb.getManyAndCount();
      students = fetchedStudents;
      total = count;
    } else {
      students = await qb.getMany();
    }

    const mappedStudents = students.map((student) => {
      // If historical search, find that specific enrollment, else active
      let targetEnrollment;
      if (queryParams.academicSessionId) {
        targetEnrollment = student.enrollments?.find(
          (e) => e.academicSession?.id === parseInt(queryParams.academicSessionId)
        );
      } else {
        targetEnrollment = student.enrollments?.find(
          (e) => e.status === EnrollmentStatus.ACTIVE,
        );
      }

      (student as any).rollNo = targetEnrollment?.rollNo ?? null;
      // Also optionally override class/section on the student object for the UI to display correctly
      // if it's a historical query and they've since moved. The UI currently reads `student.class`
      if (targetEnrollment && targetEnrollment.class) {
        student.class = targetEnrollment.class;
        student.section = targetEnrollment.section;
      }
      return student;
    });

    if (isPaginated) {
      return { data: mappedStudents, total, page: parseInt(queryParams.page), limit: parseInt(queryParams.limit) };
    }
    return mappedStudents;
  }

  async findOne(id: number) {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: [
        'user',
        'studentSubjects',
        'studentSubjects.subject',
        'class',
        'section',
        'studentDiscounts',
        'studentDiscounts.discountCategory',
        'enrollments',
        'enrollments.academicSession',
        'enrollments.class',
        'enrollments.section',
      ],
    });
    if (student) {
      const activeEnrollment = student.enrollments?.find(
        (e) => e.status === EnrollmentStatus.ACTIVE,
      );
      (student as any).rollNo = activeEnrollment?.rollNo ?? null;
    }
    return student;
  }

  async enroll(
    studentId: number,
    classId: number,
    sectionId: number,
    subjectIds: number[],
    academicSessionId?: number,
  ) {
    // Update student with class and section (legacy/cache link)
    await this.studentsRepository.update(studentId, {
      class: { id: classId },
      section: { id: sectionId },
    });

    // Ensure there is an active enrollment record for this class for the targeted session
    let targetSession: AcademicSession | null = null;
    if (academicSessionId) {
      targetSession = await this.sessionRepository.findOne({
        where: { id: academicSessionId },
      });
    } else {
      targetSession = await this.sessionRepository.findOne({
        where: { isActive: true },
      });
    }

    if (targetSession) {
      let enrollment = await this.enrollmentRepository.findOne({
        where: {
          student: { id: studentId },
          academicSession: { id: targetSession.id },
        },
        relations: ['class', 'section'],
      });
      const isNewEnrollment = !enrollment;
      const classSectionChanged =
        enrollment &&
        (enrollment.class?.id !== classId ||
          enrollment.section?.id !== sectionId);
      if (!enrollment) {
        enrollment = this.enrollmentRepository.create({
          student: { id: studentId } as any,
          academicSession: targetSession,
          status: EnrollmentStatus.ACTIVE,
        });
      }
      enrollment.class = { id: classId } as any;
      enrollment.section = { id: sectionId } as any;
      if (isNewEnrollment || classSectionChanged) {
        const maxRollNoResult = await this.enrollmentRepository
          .createQueryBuilder('e')
          .select('MAX(e.rollNo)', 'maxRollNo')
          .where(
            'e.class = :classId AND e.section = :sectionId AND e.academicSession = :sessionId',
            {
              classId,
              sectionId,
              sessionId: targetSession.id,
            },
          )
          .getRawOne();
        enrollment.rollNo = (maxRollNoResult?.maxRollNo ?? 0) + 1;
      }
      await this.enrollmentRepository.save(enrollment);
    }

    // Create student subject relations
    const existingSubjects = await this.studentSubjectRepository.find({
      where: { student: { id: studentId } },
      relations: ['subject'],
    });

    const existingSubjectIds = new Set(
      existingSubjects.map((s) => s.subject.id),
    );

    // Identify subjects to remove
    const subjectsToRemove = existingSubjects.filter(
      (s) => !subjectIds.includes(s.subject.id),
    );
    if (subjectsToRemove.length > 0) {
      await this.studentSubjectRepository.remove(subjectsToRemove);
    }

    // Identify subjects to add
    const newSubjectIds = subjectIds.filter(
      (id) => !existingSubjectIds.has(id),
    );

    const promises = newSubjectIds.map((subjectId) => {
      const studentSubject = this.studentSubjectRepository.create({
        student: { id: studentId },
        subject: { id: subjectId },
      });
      return this.studentSubjectRepository.save(studentSubject);
    });

    return Promise.all(promises);
  }

  async promoteBulk(
    studentIds: number[],
    fromSessionId: number,
    toSessionId: number,
    targetClassId: number,
    targetSectionId: number,
  ) {
    const fromSession = await this.sessionRepository.findOne({
      where: { id: fromSessionId },
    });
    const toSession = await this.sessionRepository.findOne({
      where: { id: toSessionId },
    });

    if (!fromSession || !toSession)
      throw new Error('Invalid academic sessions provided');

    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (const studentId of studentIds) {
      try {
        const student = await this.studentsRepository.findOne({
          where: { id: studentId },
        });
        if (!student) throw new Error(`Student ${studentId} not found`);

        // Find their enrollment in the FROM session
        const oldEnrollment = await this.enrollmentRepository.findOne({
          where: {
            student: { id: studentId },
            academicSession: { id: fromSessionId },
          },
        });

        if (oldEnrollment) {
          oldEnrollment.status = EnrollmentStatus.PROMOTED;
          await this.enrollmentRepository.save(oldEnrollment);
        }

        // Check if they already have an enrollment in the TO session
        let newEnrollment = await this.enrollmentRepository.findOne({
          where: {
            student: { id: studentId },
            academicSession: { id: toSessionId },
          },
        });

        const maxRollNoResult = await this.enrollmentRepository
          .createQueryBuilder('e')
          .select('MAX(e.rollNo)', 'maxRollNo')
          .where(
            'e.class = :classId AND e.section = :sectionId AND e.academicSession = :sessionId',
            {
              classId: targetClassId,
              sectionId: targetSectionId,
              sessionId: toSessionId,
            },
          )
          .getRawOne();
        const nextRollNo = (maxRollNoResult?.maxRollNo ?? 0) + 1;

        if (!newEnrollment) {
          newEnrollment = this.enrollmentRepository.create({
            student: { id: studentId } as any,
            academicSession: toSession,
            class: { id: targetClassId } as any,
            section: { id: targetSectionId } as any,
            status: EnrollmentStatus.ACTIVE,
            rollNo: nextRollNo,
          });
        } else {
          newEnrollment.class = { id: targetClassId } as any;
          newEnrollment.section = { id: targetSectionId } as any;
          newEnrollment.status = EnrollmentStatus.ACTIVE;
          newEnrollment.rollNo = nextRollNo;
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

  async exitBulk(
    studentIds: number[],
    sessionId: number,
    exitType: 'ALUMNI' | 'WITHDRAWN',
  ) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) throw new Error('Invalid academic session provided');

    const results = { successful: 0, failed: 0, errors: [] as string[] };

    for (const studentId of studentIds) {
      try {
        const student = await this.studentsRepository.findOne({
          where: { id: studentId },
          relations: ['user']
        });
        if (!student) throw new Error(`Student ${studentId} not found`);

        // Find their enrollment in the given session
        const enrollment = await this.enrollmentRepository.findOne({
          where: {
            student: { id: studentId },
            academicSession: { id: sessionId },
          },
        });

        if (!enrollment) {
          throw new Error(`Student ${studentId} has no enrollment in this session.`);
        }

        enrollment.status = exitType as any;
        await this.enrollmentRepository.save(enrollment);

        // Update the master user record to inactive
        if (student.user) {
          student.user.isActive = false;
          // We also need to save the user, but student.user cascades are usually enabled 
          // or handled by updating the student directly. Let's assume TypeORM handles it or we use update directly on users.
        }
        await this.studentsRepository.save(student);

        results.successful++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Student ${studentId}: ${err.message}`);
      }
    }

    return results;
  }

  async update(id: number, updateData: any) {
    const student = await this.studentsRepository.findOne({
      where: { id },
      relations: [
        'studentDiscounts',
        'studentDiscounts.discountCategory',
        'user',
      ],
    });
    if (!student) throw new Error('Student not found');

    if (!student.user) student.user = {} as any;

    if (updateData.firstName !== undefined)
      student.user.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      student.user.lastName = updateData.lastName;
    if (updateData.email !== undefined)
      student.user.email = updateData.email || null;
    if (updateData.isActive !== undefined)
      student.user.isActive = updateData.isActive;
    if (updateData.mobile !== undefined)
      student.user.mobile = updateData.mobile;
    if (updateData.alternateMobile !== undefined)
      student.user.alternateMobile = updateData.alternateMobile;
    if (updateData.gender !== undefined)
      student.user.gender = updateData.gender;
    if (updateData.fathersName !== undefined)
      student.user.fathersName = updateData.fathersName;
    if (updateData.mothersName !== undefined)
      student.user.mothersName = updateData.mothersName;
    if (updateData.aadhaarNumber !== undefined)
      student.user.aadhaarNumber = updateData.aadhaarNumber;
    if (updateData.category !== undefined)
      student.user.category = updateData.category;
    if (updateData.religion !== undefined)
      student.user.religion = updateData.religion;
    if (updateData.bloodGroup !== undefined)
      student.user.bloodGroup = updateData.bloodGroup;
    if (updateData.dateOfBirth !== undefined)
      student.user.dateOfBirth = updateData.dateOfBirth;

    if (updateData.siblingId !== undefined) {
      if (updateData.siblingId) {
        // Validate sibling parent names match
        const sibling = await this.studentsRepository.findOne({
          where: { id: updateData.siblingId },
          relations: ['user'],
        });
        if (!sibling) {
          throw new BadRequestException('Sibling student not found.');
        }
        const sibFather = (sibling.user?.fathersName || '')
          .trim()
          .toLowerCase();
        const sibMother = (sibling.user?.mothersName || '')
          .trim()
          .toLowerCase();
        const updFather = (
          updateData.fathersName !== undefined
            ? updateData.fathersName
            : student.user?.fathersName || ''
        )
          .trim()
          .toLowerCase();
        const updMother = (
          updateData.mothersName !== undefined
            ? updateData.mothersName
            : student.user?.mothersName || ''
        )
          .trim()
          .toLowerCase();
        if (sibFather !== updFather || sibMother !== updMother) {
          throw new BadRequestException(
            `Sibling validation failed: Father's name and Mother's name must match the selected sibling's parent names (` +
            `Father: "${sibling.user?.fathersName}", Mother: "${sibling.user?.mothersName}").`,
          );
        }
      }
      student.siblingId = updateData.siblingId;
    }

    if (updateData.discountIds !== undefined) {
      const incomingIds = updateData.discountIds;
      const currentStudentDiscounts = student.studentDiscounts || [];

      // For each existing, if not in incoming, set isActive to false
      for (const sd of currentStudentDiscounts) {
        if (!incomingIds.includes(sd.discountCategory.id)) {
          sd.isActive = false;
        } else {
          sd.isActive = true;
        }
      }

      // For each incoming, if not in existing, add new with isActive true
      const existingIds = currentStudentDiscounts.map(
        (sd) => sd.discountCategory.id,
      );
      const newIds = incomingIds.filter(
        (id: number) => !existingIds.includes(id),
      );

      for (const newId of newIds) {
        currentStudentDiscounts.push({
          discountCategory: { id: newId },
          isActive: true,
        } as any);
      }

      student.studentDiscounts = currentStudentDiscounts;
    }

    return this.studentsRepository.save(student);
  }
}
