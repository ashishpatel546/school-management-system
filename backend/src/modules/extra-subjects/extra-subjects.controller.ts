import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ExtraSubjectsService } from './extra-subjects.service';
import { CreateExtraSubjectDto } from './dto/create-extra-subject.dto';

@Controller('extra-subjects')
export class ExtraSubjectsController {
    constructor(private readonly extraSubjectsService: ExtraSubjectsService) { }

    @Post()
    create(@Body() createExtraSubjectDto: CreateExtraSubjectDto) {
        return this.extraSubjectsService.create(createExtraSubjectDto);
    }

    @Get()
    findAll() {
        return this.extraSubjectsService.findAll();
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any) {
        return this.extraSubjectsService.update(id, updateData);
    }
}
