import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { FeeCategory } from './fee-category.entity';

@Entity()
export class FeeStructure {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Class, { onDelete: 'CASCADE' })
    class: Class;

    @ManyToOne(() => FeeCategory, { onDelete: 'CASCADE' })
    feeCategory: FeeCategory;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    academicYear: string;
}
