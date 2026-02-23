import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

export enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FLAT = 'FLAT'
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

    @ManyToMany(() => Student, (student) => student.discounts)
    students: Student[];
}
