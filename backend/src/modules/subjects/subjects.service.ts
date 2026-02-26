import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
    constructor(
        @InjectRepository(Subject)
        private subjectsRepository: Repository<Subject>,
    ) { }

    create(createSubjectDto: CreateSubjectDto) {
        const payload: any = {
            name: createSubjectDto.name,
            subjectCategory: createSubjectDto.subjectCategory
        };
        if (createSubjectDto.feeCategoryId) {
            payload.feeCategory = { id: createSubjectDto.feeCategoryId };
        }

        const subject = this.subjectsRepository.create(payload);
        return this.subjectsRepository.save(subject);
    }

    findAll() {
        return this.subjectsRepository.find({ relations: ['feeCategory'] });
    }

    async update(id: number, updateData: UpdateSubjectDto) {
        const payload: any = {};
        if (updateData.name !== undefined) payload.name = updateData.name;
        if (updateData.subjectCategory !== undefined) payload.subjectCategory = updateData.subjectCategory;

        if (updateData.feeCategoryId !== undefined) {
            if (updateData.feeCategoryId === null) {
                payload.feeCategory = null;
            } else {
                payload.feeCategory = { id: updateData.feeCategoryId };
            }
        }

        await this.subjectsRepository.update(id, payload);
        return this.subjectsRepository.findOne({ where: { id }, relations: ['feeCategory'] });
    }
}
