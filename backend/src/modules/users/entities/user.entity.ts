import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
    PARENT = 'PARENT',
}

export enum Religion {
    HINDU = 'HINDU',
    MUSLIM = 'MUSLIM',
    SIKH = 'SIKH',
    CHRISTIAN = 'CHRISTIAN',
    PARSI = 'PARSI',
    OTHERS = 'OTHERS',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT,
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    mobile: string;

    @Column({ nullable: true })
    alternateMobile: string;

    @Column({ nullable: true })
    gender: string;

    @Column({ nullable: true })
    fathersName: string;

    @Column({ nullable: true })
    mothersName: string;

    @Column({ nullable: true })
    aadhaarNumber: string;

    @Column({ nullable: true })
    category: string;

    @Column({
        type: 'enum',
        enum: Religion,
        nullable: true,
    })
    religion: Religion;

    @Column({ nullable: true })
    bloodGroup: string;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
