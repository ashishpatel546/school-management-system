import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @ApiOperation({ summary: 'Submit or update daily attendance' })
    @Post()
    submitAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
        return this.attendanceService.submitAttendance(createAttendanceDto);
    }

    @ApiOperation({ summary: 'Get existing attendance for a specific class, section, and date' })
    @Get('class/:classId/section/:sectionId')
    getAttendance(
        @Param('classId', ParseIntPipe) classId: number,
        @Param('sectionId', ParseIntPipe) sectionId: number,
        @Query('date') date: string,
    ) {
        return this.attendanceService.getAttendance(classId, sectionId, date);
    }

    @ApiOperation({ summary: 'Get attendance history for an individual student' })
    @Get('student/:studentId')
    getStudentAttendanceHistory(@Param('studentId', ParseIntPipe) studentId: number) {
        return this.attendanceService.getStudentAttendanceHistory(studentId);
    }
}
