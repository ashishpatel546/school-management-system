import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class } from './entities/class.entity';
import { Section } from './entities/section.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassTeacherHistory } from '../history/entities/class-teacher-history.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Class, Section, Teacher, ClassTeacherHistory])],
    controllers: [ClassesController],
    providers: [ClassesService],
    exports: [ClassesService],
})
export class ClassesModule { }
