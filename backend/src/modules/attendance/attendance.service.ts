import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { StudentAttendance } from './entities/student-attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(StudentAttendance)
        private studentAttendanceRepository: Repository<StudentAttendance>,
    ) { }

    async getAttendance(classId: number, sectionId: number, date: string) {
        return this.attendanceRepository.findOne({
            where: {
                class: { id: classId },
                section: { id: sectionId },
                date: date as any, // TypeORM 'date' type works well with strings in YYYY-MM-DD format
            },
            relations: ['studentAttendances', 'studentAttendances.student', 'takenBy'],
        });
    }

    async submitAttendance(dto: CreateAttendanceDto) {
        let attendance = await this.attendanceRepository.findOne({
            where: {
                class: { id: dto.classId },
                section: { id: dto.sectionId },
                date: dto.date as any,
            },
            relations: ['studentAttendances'],
        });

        if (attendance) {
            // Update existing attendance
            attendance.takenBy = { id: dto.teacherId } as any;
            attendance.timestamp = new Date(); // update timestamp

            // Delete old student attendances to replace with new ones
            await this.studentAttendanceRepository.delete({ attendance: { id: attendance.id } });

            attendance.studentAttendances = dto.students.map(sa => this.studentAttendanceRepository.create({
                student: { id: sa.studentId },
                status: sa.status,
                remarks: sa.remarks,
            }));

            return this.attendanceRepository.save(attendance);
        } else {
            // Create new attendance
            const newAttendance = this.attendanceRepository.create({
                date: dto.date as any,
                class: { id: dto.classId },
                section: { id: dto.sectionId },
                takenBy: { id: dto.teacherId },
                studentAttendances: dto.students.map(sa => this.studentAttendanceRepository.create({
                    student: { id: sa.studentId },
                    status: sa.status,
                    remarks: sa.remarks,
                }))
            });

            return this.attendanceRepository.save(newAttendance);
        }
    }

    async getStudentAttendanceHistory(studentId: number) {
        return this.studentAttendanceRepository.find({
            where: { student: { id: studentId } },
            relations: ['attendance'],
            order: {
                attendance: {
                    date: 'DESC'
                }
            }
        });
    }
}
