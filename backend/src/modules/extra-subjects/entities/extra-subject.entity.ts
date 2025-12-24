import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StudentSubject } from '../../students/entities/student-subject.entity';

@Entity()
export class ExtraSubject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => StudentSubject, (studentSubject) => studentSubject.extraSubject)
    studentSubjects: StudentSubject[];
}
