import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { DiscountCategory } from './discount-category.entity';

@Entity('student_discounts')
export class StudentDiscount {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.studentDiscounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @ManyToOne(() => DiscountCategory, (discountCategory) => discountCategory.studentDiscounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'discountCategoryId' })
    discountCategory: DiscountCategory;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdOn: Date;

    @UpdateDateColumn()
    updatedOn: Date;
}
