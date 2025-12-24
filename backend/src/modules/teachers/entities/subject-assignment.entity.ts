import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Teacher } from './teacher.entity';
import { ExtraSubject } from '../../extra-subjects/entities/extra-subject.entity';
import { Class } from '../../classes/entities/class.entity';
import { Section } from '../../classes/entities/section.entity';

@Entity()
export class SubjectAssignment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Teacher, (teacher) => teacher.subjectAssignments)
    teacher: Teacher;

    @ManyToOne(() => ExtraSubject)
    subject: ExtraSubject;

    @ManyToOne(() => Class)
    class: Class;

    @ManyToOne(() => Section)
    section: Section;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;
}
