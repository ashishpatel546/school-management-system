import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ExamSetting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    finalTargetCategoryId: number | null;

    // Stores an array of ExamCategory IDs that contribute to the Final Result
    @Column({ type: 'jsonb', nullable: true })
    contributingCategoryIds: number[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
