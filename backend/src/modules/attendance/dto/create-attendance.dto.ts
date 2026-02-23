import { IsNotEmpty, IsDateString, IsNumber, IsArray, ValidateNested, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../entities/student-attendance.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentAttendanceDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    studentId: number;

    @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
    @IsEnum(AttendanceStatus)
    @IsNotEmpty()
    status: AttendanceStatus;

    @ApiPropertyOptional({ example: 'Arrived after 1st period' })
    @IsString()
    @IsOptional()
    remarks?: string;
}

export class CreateAttendanceDto {
    @ApiProperty({ example: '2026-02-22' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    teacherId: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    classId: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    sectionId: number;

    @ApiProperty({ type: [StudentAttendanceDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentAttendanceDto)
    students: StudentAttendanceDto[];
}
