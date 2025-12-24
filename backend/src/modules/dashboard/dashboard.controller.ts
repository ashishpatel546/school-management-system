import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Class } from '../classes/entities/class.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        @InjectRepository(Teacher)
        private teachersRepository: Repository<Teacher>,
        @InjectRepository(Class)
        private classesRepository: Repository<Class>,
    ) { }

    @Get('stats')
    async getStats() {
        const [students, teachers, classes] = await Promise.all([
            this.studentsRepository.count({ where: { isActive: true } }),
            this.teachersRepository.count({ where: { isActive: true } }),
            this.classesRepository.count(),
        ]);

        return {
            students,
            teachers,
            classes,
        };
    }
}
