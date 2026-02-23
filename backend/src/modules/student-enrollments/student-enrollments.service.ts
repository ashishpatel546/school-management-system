import { Injectable } from '@nestjs/common';
import { CreateStudentEnrollmentDto } from './dto/create-student-enrollment.dto';
import { UpdateStudentEnrollmentDto } from './dto/update-student-enrollment.dto';

@Injectable()
export class StudentEnrollmentsService {
  create(createStudentEnrollmentDto: CreateStudentEnrollmentDto) {
    return 'This action adds a new studentEnrollment';
  }

  findAll() {
    return `This action returns all studentEnrollments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studentEnrollment`;
  }

  update(id: number, updateStudentEnrollmentDto: UpdateStudentEnrollmentDto) {
    return `This action updates a #${id} studentEnrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentEnrollment`;
  }
}
