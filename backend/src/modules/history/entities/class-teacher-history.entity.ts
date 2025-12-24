import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class ClassTeacherHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Teacher)
    teacher: Teacher;

    @ManyToOne(() => Class)
    class: Class;

    @Column()
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
