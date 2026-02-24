import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';
import { SubjectAssignment } from './subject-assignment.entity';

@Entity()
export class Teacher {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { cascade: true, eager: true })
    @JoinColumn()
    user: User;

    @OneToMany(() => Section, (section) => section.classTeacher, { nullable: true })
    classTeacherOf: Section[];

    @OneToMany(() => SubjectAssignment, (assignment) => assignment.teacher)
    subjectAssignments: SubjectAssignment[];
}
