import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StudentDiscount } from './student-discount.entity';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FLAT = 'FLAT'
}

export enum DiscountApplicationType {
    AUTO = 'AUTO',
    MANUAL = 'MANUAL'
}

@Entity()
export class DiscountCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: DiscountType,
        default: DiscountType.FLAT
    })
    type: DiscountType;

    @Column('decimal', { precision: 10, scale: 2 })
    value: number;

    @Column({
        type: 'enum',
        enum: DiscountApplicationType,
        default: DiscountApplicationType.MANUAL
    })
    applicationType: DiscountApplicationType;

    @Column({ nullable: true })
    logicReference: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => StudentDiscount, (sd) => sd.discountCategory)
    studentDiscounts: StudentDiscount[];
}
