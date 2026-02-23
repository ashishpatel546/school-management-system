import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicSession } from './entities/academic-session.entity';

@Injectable()
export class AcademicSessionsService {
  constructor(
    @InjectRepository(AcademicSession)
    private sessionRepository: Repository<AcademicSession>,
  ) { }

  async create(createAcademicSessionDto: CreateAcademicSessionDto) {
    const session = this.sessionRepository.create(createAcademicSessionDto);
    return await this.sessionRepository.save(session);
  }

  findAll() {
    return this.sessionRepository.find({ order: { startDate: 'DESC' } });
  }

  async findOne(id: number) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Academic Session not found');
    return session;
  }

  async update(id: number, updateAcademicSessionDto: UpdateAcademicSessionDto) {
    await this.sessionRepository.update(id, updateAcademicSessionDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} academicSession`;
  }
}
