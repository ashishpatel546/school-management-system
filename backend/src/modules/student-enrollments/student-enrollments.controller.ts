import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentEnrollmentsService } from './student-enrollments.service';
import { CreateStudentEnrollmentDto } from './dto/create-student-enrollment.dto';
import { UpdateStudentEnrollmentDto } from './dto/update-student-enrollment.dto';

@Controller('student-enrollments')
export class StudentEnrollmentsController {
  constructor(private readonly studentEnrollmentsService: StudentEnrollmentsService) {}

  @Post()
  create(@Body() createStudentEnrollmentDto: CreateStudentEnrollmentDto) {
    return this.studentEnrollmentsService.create(createStudentEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.studentEnrollmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentEnrollmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentEnrollmentDto: UpdateStudentEnrollmentDto) {
    return this.studentEnrollmentsService.update(+id, updateStudentEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentEnrollmentsService.remove(+id);
  }
}
