import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Class } from './class.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity()
export class Section {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => Class, (cls) => cls.sections)
    class: Class;

    @OneToMany(() => Student, (student) => student.section)
    students: Student[];

    @ManyToOne(() => Teacher, (teacher) => teacher.classTeacherOf)
    classTeacher: Teacher;
}
