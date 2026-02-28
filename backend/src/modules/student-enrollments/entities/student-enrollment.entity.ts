import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';
import { AcademicSession } from '../../academic-sessions/entities/academic-session.entity';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  PROMOTED = 'PROMOTED',
  DETAINED = 'DETAINED',
  ALUMNI = 'ALUMNI',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity()
export class StudentEnrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.enrollments, {
    onDelete: 'CASCADE',
  })
  student: Student;

  @ManyToOne(() => Class)
  class: Class;

  @ManyToOne(() => Section)
  section: Section;

  @ManyToOne(() => AcademicSession)
  academicSession: AcademicSession;

  @Column({ default: 0 })
  rollNo: number;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
