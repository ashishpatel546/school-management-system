import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { StudentSubject } from '../../students/entities/student-subject.entity';
import { FeeCategory } from '../../fees/entities/fee-category.entity';

export enum SubjectCategory {
    BASE = 'BASE',
    OPTIONAL = 'OPTIONAL',
    VOCATIONAL = 'VOCATIONAL',
    ACTIVITY = 'ACTIVITY'
}

@Entity('subject')
export class Subject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: SubjectCategory,
        default: SubjectCategory.BASE
    })
    subjectCategory: SubjectCategory;

    @ManyToOne(() => FeeCategory, { nullable: true })
    @JoinColumn()
    feeCategory: FeeCategory;

    @OneToMany(() => StudentSubject, (studentSubject) => studentSubject.subject)
    studentSubjects: StudentSubject[];
}
