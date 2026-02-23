import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './modules/students/entities/student.entity';
import { AcademicSession } from './modules/academic-sessions/entities/academic-session.entity';
import { StudentEnrollment, EnrollmentStatus } from './modules/student-enrollments/entities/student-enrollment.entity';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(AcademicSession)
    private sessionRepository: Repository<AcademicSession>,
    @InjectRepository(StudentEnrollment)
    private enrollmentRepository: Repository<StudentEnrollment>,
  ) { }

  async onModuleInit() {
    // Auto-Migration: Ensure '2026-2027' session exists and is active.
    let activeSession = await this.sessionRepository.findOne({ where: { name: '2026-2027' } });

    if (!activeSession) {
      activeSession = this.sessionRepository.create({
        name: '2026-2027',
        startDate: '2026-04-01',
        endDate: '2027-03-31',
        isActive: true
      });
      await this.sessionRepository.save(activeSession);
      this.logger.log('Created default active Academic Session: 2026-2027');
    }

    // Auto-Migration: Port all legacy students into StudentEnrollment if missing
    const legacyStudents = await this.studentRepository.find({
      relations: ['class', 'section', 'enrollments'],
    });

    let migrationCount = 0;
    for (const student of legacyStudents) {
      if (student.class && student.section) {
        // Check if they already have an enrollment for 2026-2027
        const hasCurrentEnrollment = await this.enrollmentRepository.findOne({
          where: { student: { id: student.id }, academicSession: { id: activeSession.id } }
        });

        if (!hasCurrentEnrollment) {
          const newEnrollment = this.enrollmentRepository.create({
            student,
            class: student.class,
            section: student.section,
            academicSession: activeSession,
            status: EnrollmentStatus.ACTIVE
          });
          await this.enrollmentRepository.save(newEnrollment);
          migrationCount++;
        }
      }
    }

    if (migrationCount > 0) {
      this.logger.log(`Auto-Migrated ${migrationCount} legacy students to the StudentEnrollment architecture.`);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
