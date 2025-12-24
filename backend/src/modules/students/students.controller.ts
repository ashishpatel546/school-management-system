import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Post()
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    findAll() {
        return this.studentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.studentsService.findOne(id);
    }

    @Post(':id/enroll')
    enroll(@Param('id', ParseIntPipe) id: number, @Body() enrollmentData: { classId: number; sectionId: number; subjectIds: number[] }) {
        return this.studentsService.enroll(id, enrollmentData.classId, enrollmentData.sectionId, enrollmentData.subjectIds);
    }

    @Patch(':id/promote')
    promote(@Param('id', ParseIntPipe) id: number, @Body() promotionData: { classId: number; sectionId: number }) {
        return this.studentsService.promote(id, promotionData.classId, promotionData.sectionId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
        return this.studentsService.update(id, updateData);
    }
}
