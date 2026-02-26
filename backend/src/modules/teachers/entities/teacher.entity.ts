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

    // --- Teacher-specific optional fields ---

    /**
     * Auto-generated numeric employee code (e.g. 1001, 1002, ...). Unique, set by service on creation.
     */
    @Column({ nullable: true, unique: true })
    employeeCode: number;

    @Column({ nullable: true })
    department: string;

    @Column({ type: 'date', nullable: true })
    joiningDate: string;

    @Column({ type: 'date', nullable: true })
    exitDate: string;

    @Column({ nullable: true })
    qualification: string;

    // --- Relationships ---

    @OneToMany(() => Section, (section) => section.classTeacher, { nullable: true })
    classTeacherOf: Section[];

    @OneToMany(() => SubjectAssignment, (assignment) => assignment.teacher)
    subjectAssignments: SubjectAssignment[];
}
