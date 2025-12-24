import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtraSubject } from './entities/extra-subject.entity';
import { CreateExtraSubjectDto } from './dto/create-extra-subject.dto';

@Injectable()
export class ExtraSubjectsService {
    constructor(
        @InjectRepository(ExtraSubject)
        private extraSubjectsRepository: Repository<ExtraSubject>,
    ) { }

    create(createExtraSubjectDto: CreateExtraSubjectDto) {
        const extraSubject = this.extraSubjectsRepository.create(createExtraSubjectDto);
        return this.extraSubjectsRepository.save(extraSubject);
    }

    findAll() {
        return this.extraSubjectsRepository.find();
    }

    async update(id: number, updateData: Partial<ExtraSubject>) {
        await this.extraSubjectsRepository.update(id, updateData);
        return this.extraSubjectsRepository.findOne({ where: { id } });
    }
}
