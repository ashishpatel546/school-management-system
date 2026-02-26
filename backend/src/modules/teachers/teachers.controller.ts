import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Query, Delete } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { AssignSubjectDto } from './dto/assign-subject.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    private flattenUser(entity: any) {
        if (!entity || !entity.user) return entity;
        const { user, ...rest } = entity;
        return { ...rest, ...user, id: entity.id };
    }

    @Post()
    async create(@Body() createTeacherDto: CreateTeacherDto) {
        const teacher = await this.teachersService.create(createTeacherDto);
        return this.flattenUser(teacher);
    }

    @Get()
    async findAll(@Query() query: any) {
        const teachers = await this.teachersService.findAll(query);
        return teachers.map(t => this.flattenUser(t));
    }

    @Get(':id/history')
    getHistory(@Param('id', ParseIntPipe) id: number) {
        return this.teachersService.getHistory(id);
    }



    @Post(':id/assign-subject')
    assignSubject(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignSubjectDto) {
        return this.teachersService.assignSubject(id, dto);
    }

    @Delete(':teacherId/assignments/:assignmentId')
    unassignSubject(
        @Param('teacherId', ParseIntPipe) teacherId: number,
        @Param('assignmentId', ParseIntPipe) assignmentId: number,
    ) {
        return this.teachersService.unassignSubject(assignmentId);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
        const teacher = await this.teachersService.update(id, updateData);
        return this.flattenUser(teacher);
    }
}
