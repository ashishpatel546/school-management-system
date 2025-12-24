import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
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

    @OneToOne(() => Class, (cls) => cls.classTeacher, { nullable: true })
    classTeacherOf: Class;

    @OneToMany(() => SubjectAssignment, (assignment) => assignment.teacher)
    subjectAssignments: SubjectAssignment[];
}
