import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Section } from '../../classes/entities/section.entity';

@Entity()
export class ClassTeacherHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Teacher)
    teacher: Teacher;

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
