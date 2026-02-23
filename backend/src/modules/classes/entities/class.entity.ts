import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Section } from './section.entity';
import { Student } from '../../students/entities/student.entity';


@Entity()
export class Class {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Section, (section) => section.class)
    sections: Section[];

    @OneToMany(() => Student, (student) => student.class)
    students: Student[];


}
