import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Class } from '../classes/entities/class.entity';
import { FeePayment } from '../fees/entities/fee-payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { StudentAttendance } from '../attendance/entities/student-attendance.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Student, Teacher, Class, FeePayment, Attendance, StudentAttendance])],
    controllers: [DashboardController],
})
export class DashboardModule { }
