import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  private flattenUser(entity: any) {
    if (!entity || !entity.user) return entity;
    const { user, ...rest } = entity;
    return { ...rest, ...user, id: entity.id };
  }

  @Post()
  async create(@Body() createStudentDto: CreateStudentDto) {
    const student = await this.studentsService.create(createStudentDto);
    return this.flattenUser(student);
  }

  @Get()
  async findAll(@Query() query: any) {
    const students = await this.studentsService.findAll(query);

    // Support both paginated list and raw array
    if ((students as any).data) {
      const paginated = students as any;
      return {
        ...paginated,
        data: paginated.data.map((s: any) => this.flattenUser(s))
      };
    }

    return (students as any[]).map((s) => this.flattenUser(s));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const student = await this.studentsService.findOne(id);
    return this.flattenUser(student);
  }

  @Post(':id/enroll')
  enroll(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    enrollmentData: {
      classId: number;
      sectionId: number;
      subjectIds: number[];
      academicSessionId?: number;
    },
  ) {
    return this.studentsService.enroll(
      id,
      enrollmentData.classId,
      enrollmentData.sectionId,
      enrollmentData.subjectIds,
      enrollmentData.academicSessionId,
    );
  }

  @Post('promotions/bulk')
  bulkPromote(
    @Body()
    promotionData: {
      studentIds: number[];
      fromSessionId: number;
      toSessionId: number;
      targetClassId: number;
      targetSectionId: number;
    },
  ) {
    return this.studentsService.promoteBulk(
      promotionData.studentIds,
      promotionData.fromSessionId,
      promotionData.toSessionId,
      promotionData.targetClassId,
      promotionData.targetSectionId,
    );
  }

  @Post('exits/bulk')
  bulkExit(
    @Body()
    exitData: {
      studentIds: number[];
      sessionId: number;
      exitType: 'ALUMNI' | 'WITHDRAWN';
    },
  ) {
    return this.studentsService.exitBulk(
      exitData.studentIds,
      exitData.sessionId,
      exitData.exitType,
    );
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
    const student = await this.studentsService.update(id, updateData);
    return this.flattenUser(student);
  }
}
