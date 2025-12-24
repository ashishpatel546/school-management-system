import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Class } from './class.entity';
import { Student } from '../../students/entities/student.entity';

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
}
