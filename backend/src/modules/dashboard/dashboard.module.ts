import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Class } from '../classes/entities/class.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Student, Teacher, Class])],
    controllers: [DashboardController],
})
export class DashboardModule { }
