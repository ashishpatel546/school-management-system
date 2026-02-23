import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    @Post()
    create(@Body() createTeacherDto: CreateTeacherDto) {
        return this.teachersService.create(createTeacherDto);
    }

    @Get()
    findAll() {
        return this.teachersService.findAll();
    }

    @Get(':id/history')
    getHistory(@Param('id', ParseIntPipe) id: number) {
        return this.teachersService.getHistory(id);
    }



    @Post(':id/assign-subject')
    assignSubject(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignSubjectDto) {
        return this.teachersService.assignSubject(id, dto);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
        return this.teachersService.update(id, updateData);
    }
}
