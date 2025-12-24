import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post()
    createClass(@Body() createClassDto: CreateClassDto) {
        return this.classesService.createClass(createClassDto);
    }

    @Get()
    findAllClasses() {
        return this.classesService.findAllClasses();
    }

    @Patch(':id')
    updateClass(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
        return this.classesService.updateClass(id, updateData);
    }

    @Post('sections')
    createSection(@Body() createSectionDto: CreateSectionDto) {
        return this.classesService.createSection(createSectionDto);
    }

    @Get('sections')
    findAllSections() {
        return this.classesService.findAllSections();
    }

    @Patch('sections/:id')
    updateSection(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
        return this.classesService.updateSection(id, name);
    }

    @Delete('sections/:id')
    deleteSection(@Param('id', ParseIntPipe) id: number) {
        return this.classesService.deleteSection(id);
    }

    @Post(':id/teacher')
    assignClassTeacher(@Param('id', ParseIntPipe) id: number, @Body('teacherId', ParseIntPipe) teacherId: number) {
        return this.classesService.assignClassTeacher(id, teacherId);
    }
}
