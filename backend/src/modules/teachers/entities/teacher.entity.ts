import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';
import { SubjectAssignment } from './subject-assignment.entity';

@Entity()
export class Teacher {
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

    @OneToMany(() => Section, (section) => section.classTeacher, { nullable: true })
    classTeacherOf: Section[];

    @OneToMany(() => SubjectAssignment, (assignment) => assignment.teacher)
    subjectAssignments: SubjectAssignment[];
}
