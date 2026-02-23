import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';
import { StudentAttendance } from './student-attendance.entity';

@Entity()
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(() => Teacher, { nullable: true })
    takenBy: Teacher;

    @ManyToOne(() => Class)
    class: Class;

    @ManyToOne(() => Section)
    section: Section;

    @OneToMany(() => StudentAttendance, (studentAttendance) => studentAttendance.attendance, { cascade: true })
    studentAttendances: StudentAttendance[];
}
