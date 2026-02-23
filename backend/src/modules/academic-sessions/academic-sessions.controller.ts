import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AcademicSessionsService } from './academic-sessions.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';

@Controller('academic-sessions')
export class AcademicSessionsController {
  constructor(private readonly academicSessionsService: AcademicSessionsService) {}

  @Post()
  create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
    return this.academicSessionsService.create(createAcademicSessionDto);
  }

  @Get()
  findAll() {
    return this.academicSessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicSessionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcademicSessionDto: UpdateAcademicSessionDto) {
    return this.academicSessionsService.update(+id, updateAcademicSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicSessionsService.remove(+id);
  }
}
