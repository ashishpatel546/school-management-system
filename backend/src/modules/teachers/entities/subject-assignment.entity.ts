import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';
import { AcademicSession } from '../../academic-sessions/entities/academic-session.entity';

@Entity()
export class SubjectAssignment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Teacher, (teacher) => teacher.subjectAssignments)
    teacher: Teacher;

    @ManyToOne(() => Subject)
    subject: Subject;

    @ManyToOne(() => Class)
    class: Class;

    @ManyToOne(() => Section)
    section: Section;

    /**
     * Academic session this assignment belongs to.
     * Nullable for backward compatibility with existing records.
     * Enables history queries like: "Who taught Physics in 9-A during 2024-25?"
     */
    @ManyToOne(() => AcademicSession, { nullable: true, eager: true })
    academicSession: AcademicSession;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;
}
