import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Class } from '../classes/entities/class.entity';
import { FeePayment } from '../fees/entities/fee-payment.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { StudentAttendance } from '../attendance/entities/student-attendance.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        @InjectRepository(Teacher)
        private teachersRepository: Repository<Teacher>,
        @InjectRepository(Class)
        private classesRepository: Repository<Class>,
        @InjectRepository(FeePayment)
        private feePaymentsRepository: Repository<FeePayment>,
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(StudentAttendance)
        private studentAttendanceRepository: Repository<StudentAttendance>,
    ) { }

    @Get('stats')
    async getStats() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        // Formatted today string for PG 'YYYY-MM-DD'
        const todayString = today.toISOString().split('T')[0];

        const [students, teachers, classes, feesData, attendance] = await Promise.all([
            this.studentsRepository.createQueryBuilder('student')
                .leftJoin('student.user', 'user')
                .where('user.isActive = :isActive', { isActive: true })
                .getCount(),
            this.teachersRepository.createQueryBuilder('teacher')
                .leftJoin('teacher.user', 'user')
                .where('user.isActive = :isActive', { isActive: true })
                .getCount(),
            this.classesRepository.count(),
            this.feePaymentsRepository.createQueryBuilder('payment')
                .where('payment.paymentDate >= :startOfMonth', { startOfMonth })
                .andWhere('payment.paymentDate <= :endOfMonth', { endOfMonth })
                .select('SUM(payment.amountPaid)', 'totalCollected')
                .getRawOne(),
            this.studentAttendanceRepository.createQueryBuilder('studentAttendance')
                .leftJoin('studentAttendance.attendance', 'attendance')
                .where('attendance.date = :date', { date: todayString })
                .andWhere('studentAttendance.status = :status', { status: 'PRESENT' })
                .getCount()
        ]);

        return {
            students,
            teachers,
            classes,
            feesCollected: parseFloat(feesData?.totalCollected || 0),
            attendanceToday: attendance
        };
    }
}
