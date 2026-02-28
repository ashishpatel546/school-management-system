import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AcademicSession } from '../../academic-sessions/entities/academic-session.entity';

@Entity('grading_systems')
export class GradingSystem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AcademicSession)
    @JoinColumn({ name: 'session_id' })
    session: AcademicSession;

    @Column({ name: 'session_id' })
    sessionId: number;

    @Column()
    gradeName: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    minPercentage: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    maxPercentage: number;

    @Column({ default: false })
    isFailGrade: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: number;

    @Column({ nullable: true })
    updatedBy: number;
}
