import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class GlobalFeeSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 15 })
    feeDueDate: number; // The day of the month when fees become overdue

    @Column('decimal', { default: 20.00, precision: 10, scale: 2 })
    lateFeePerDay: number; // Amount charged per day past the due date
}
