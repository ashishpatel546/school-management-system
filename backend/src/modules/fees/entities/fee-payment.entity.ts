import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    ONLINE = 'ONLINE',
    CHEQUE = 'CHEQUE',
}

@Entity()
export class FeePayment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    student: Student;

    @Column()
    feeMonth: string; // e.g., '2026-01', '2026-02'

    @Column({ default: '2026-2027' })
    academicYear: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amountPaid: number;

    @Column({ nullable: true })
    discountNames: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    baseFeeAmount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    otherFeeAmount: number;

    @Column({ type: 'jsonb', nullable: true })
    feeBreakdown: any;

    @CreateDateColumn()
    paymentDate: Date;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    paymentMethod: PaymentMethod;

    @Column({ unique: true })
    receiptNumber: string;

    @Column({ nullable: true })
    remarks: string;
}
