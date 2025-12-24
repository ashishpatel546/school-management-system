import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
    PARENT = 'PARENT',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT,
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
