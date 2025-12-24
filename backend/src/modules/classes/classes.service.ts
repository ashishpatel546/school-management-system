import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { Section } from './entities/section.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { Teacher } from '../teachers/entities/teacher.entity';
import { ClassTeacherHistory } from '../history/entities/class-teacher-history.entity';

@Injectable()
export class ClassesService {
    constructor(
        @InjectRepository(Class)
        private classesRepository: Repository<Class>,
        @InjectRepository(Section)
        private sectionsRepository: Repository<Section>,
        @InjectRepository(Teacher)
        private teachersRepository: Repository<Teacher>,
        @InjectRepository(ClassTeacherHistory)
        private classTeacherHistoryRepository: Repository<ClassTeacherHistory>,
    ) { }

    createClass(createClassDto: CreateClassDto) {
        const newClass = this.classesRepository.create(createClassDto);
        return this.classesRepository.save(newClass);
    }

    findAllClasses() {
        return this.classesRepository.find({ relations: ['sections', 'classTeacher'] });
    }

    async updateClass(id: number, updateData: Partial<Class>) {
        await this.classesRepository.update(id, updateData);
        return this.classesRepository.findOne({ where: { id }, relations: ['sections', 'classTeacher'] });
    }

    async createSection(createSectionDto: CreateSectionDto) {
        const cls = await this.classesRepository.findOne({ where: { id: createSectionDto.classId } });
        if (!cls) {
            throw new NotFoundException(`Class with ID ${createSectionDto.classId} not found`);
        }
        const section = this.sectionsRepository.create({
            name: createSectionDto.name,
            class: cls,
        });
        return this.sectionsRepository.save(section);
    }

    findAllSections() {
        return this.sectionsRepository.find({ relations: ['class'] });
    }
    async updateSection(id: number, name: string) {
        await this.sectionsRepository.update(id, { name });
        return this.sectionsRepository.findOne({ where: { id }, relations: ['class'] });
    }

    async deleteSection(id: number) {
        return this.sectionsRepository.delete(id);
    }

    async assignClassTeacher(classId: number, teacherId: number) {
        const cls = await this.classesRepository.findOne({ where: { id: classId }, relations: ['classTeacher'] });
        if (!cls) throw new NotFoundException('Class not found');

        const teacher = await this.teachersRepository.findOne({ where: { id: teacherId } });
        if (!teacher) throw new NotFoundException('Teacher not found');

        // Deactivate current history
        const currentHistory = await this.classTeacherHistoryRepository.findOne({
            where: { class: { id: classId }, isActive: true }
        });

        if (currentHistory) {
            currentHistory.isActive = false;
            currentHistory.endDate = new Date();
            await this.classTeacherHistoryRepository.save(currentHistory);
        }

        // Create new history
        const history = this.classTeacherHistoryRepository.create({
            class: cls,
            teacher: teacher,
            startDate: new Date(),
            isActive: true
        });
        await this.classTeacherHistoryRepository.save(history);

        // Update class
        cls.classTeacher = teacher;
        return this.classesRepository.save(cls);
    }
}
