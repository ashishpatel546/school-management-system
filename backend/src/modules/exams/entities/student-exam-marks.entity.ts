import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { AcademicSession } from '../../academic-sessions/entities/academic-session.entity';
import { ExamCategory } from './exam-category.entity';

@Entity()
export class StudentExamMarks {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student)
    student: Student;

    @ManyToOne(() => Class)
    class: Class;

    @ManyToOne(() => Section)
    section: Section;

    @ManyToOne(() => AcademicSession)
    session: AcademicSession;

    @ManyToOne(() => Subject)
    subject: Subject;

    @ManyToOne(() => ExamCategory)
    examCategory: ExamCategory;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    totalMarks: number;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    obtainedMarks: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    percentage: number;

    @Column({ nullable: true })
    grade: string;

    @Column({ nullable: true })
    isPass: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: number;

    @Column({ nullable: true })
    updatedBy: number;
}
