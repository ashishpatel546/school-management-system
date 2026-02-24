import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StudentSubject } from './student-subject.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';
import { DiscountCategory } from '../../fees/entities/discount-category.entity';
import { StudentEnrollment } from '../../student-enrollments/entities/student-enrollment.entity';

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { cascade: true, eager: true })
    @JoinColumn()
    user: User;

    @Column({ nullable: true })
    siblingId: number;

    @OneToMany(() => StudentSubject, (studentSubject) => studentSubject.student)
    studentSubjects: StudentSubject[];

    @ManyToOne(() => Class, (cls) => cls.students, { nullable: true })
    class: Class;

    @ManyToOne(() => Section, (section) => section.students, { nullable: true })
    section: Section;

    @ManyToMany(() => DiscountCategory, (discount) => discount.students)
    @JoinTable()
    discounts: DiscountCategory[];

    @OneToMany(() => StudentEnrollment, enrollment => enrollment.student)
    enrollments: StudentEnrollment[];
}
