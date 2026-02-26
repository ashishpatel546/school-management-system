import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FeeCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;
}
