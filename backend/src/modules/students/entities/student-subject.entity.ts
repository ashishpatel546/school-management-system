import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity()
export class StudentSubject {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.studentSubjects)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @ManyToOne(() => Subject, (subject) => subject.studentSubjects)
    @JoinColumn({ name: 'extraSubjectId' })
    subject: Subject;
}
