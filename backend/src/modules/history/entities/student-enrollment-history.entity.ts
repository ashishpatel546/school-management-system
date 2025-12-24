import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';

@Entity()
export class StudentEnrollmentHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student)
    student: Student;

    @ManyToOne(() => Class)
    class: Class;

    @ManyToOne(() => Section)
    section: Section;

    @Column()
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
