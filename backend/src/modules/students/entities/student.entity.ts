import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { StudentSubject } from './student-subject.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => StudentSubject, (studentSubject) => studentSubject.student)
    studentSubjects: StudentSubject[];

    @ManyToOne(() => Class, (cls) => cls.students, { nullable: true })
    class: Class;

    @ManyToOne(() => Section, (section) => section.students, { nullable: true })
    section: Section;
}
