import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { ExtraSubject } from '../../extra-subjects/entities/extra-subject.entity';

@Entity()
export class StudentSubject {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.studentSubjects)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @ManyToOne(() => ExtraSubject, (extraSubject) => extraSubject.studentSubjects)
    @JoinColumn({ name: 'extraSubjectId' })
    extraSubject: ExtraSubject;
}
