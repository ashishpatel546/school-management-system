import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Attendance } from './attendance.entity';
import { Student } from '../../students/entities/student.entity';

export enum AttendanceStatus {
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT',
    LATE = 'LATE',
    HALF_DAY = 'HALF_DAY',
}

@Entity()
export class StudentAttendance {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Attendance, (attendance) => attendance.studentAttendances, { onDelete: 'CASCADE' })
    attendance: Attendance;

    @ManyToOne(() => Student)
    student: Student;

    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT,
    })
    status: AttendanceStatus;

    @Column({ nullable: true })
    remarks: string;
}
