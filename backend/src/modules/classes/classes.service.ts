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

    async createClass(createClassDto: CreateClassDto) {
        const newClass = this.classesRepository.create({ name: createClassDto.name });
        const savedClass = await this.classesRepository.save(newClass);

        if (createClassDto.sections && createClassDto.sections.length > 0) {
            for (const sectionDto of createClassDto.sections) {
                const newSection = this.sectionsRepository.create({
                    name: sectionDto.name,
                    class: savedClass
                });
                const savedSection = await this.sectionsRepository.save(newSection);

                if (sectionDto.teacherId) {
                    await this.assignSectionTeacher(savedSection.id, sectionDto.teacherId);
                }
            }
        }

        return this.findOneClass(savedClass.id);
    }

    findAllClasses() {
        return this.classesRepository.find({
            relations: ['sections', 'sections.classTeacher', 'sections.students']
        });
    }

    findOneClass(id: number) {
        return this.classesRepository.findOne({
            where: { id },
            relations: ['sections', 'sections.classTeacher']
        });
    }

    async updateClass(id: number, updateData: Partial<Class>) {
        await this.classesRepository.update(id, updateData);
        return this.findOneClass(id);
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
        return this.sectionsRepository.find({ relations: ['class', 'classTeacher'] });
    }

    async updateSection(id: number, name: string) {
        await this.sectionsRepository.update(id, { name });
        return this.sectionsRepository.findOne({ where: { id }, relations: ['class', 'classTeacher'] });
    }

    async deleteSection(id: number) {
        return this.sectionsRepository.delete(id);
    }

    async assignSectionTeacher(sectionId: number, teacherId: number) {
        const section = await this.sectionsRepository.findOne({ where: { id: sectionId }, relations: ['classTeacher'] });
        if (!section) throw new NotFoundException('Section not found');

        const teacher = await this.teachersRepository.findOne({ where: { id: teacherId } });
        if (!teacher) throw new NotFoundException('Teacher not found');



        // Deactivate current history
        const currentHistory = await this.classTeacherHistoryRepository.findOne({
            where: { section: { id: sectionId }, isActive: true }
        });

        if (currentHistory) {
            currentHistory.isActive = false;
            currentHistory.endDate = new Date();
            await this.classTeacherHistoryRepository.save(currentHistory);
        }

        // Create new history
        const history = this.classTeacherHistoryRepository.create({
            section: section,
            teacher: teacher,
            startDate: new Date(),
            isActive: true
        });
        await this.classTeacherHistoryRepository.save(history);

        // Update section
        section.classTeacher = teacher;
        return this.sectionsRepository.save(section);
    }
}
