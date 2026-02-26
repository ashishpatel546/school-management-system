import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { SubjectCategory } from '../entities/subject.entity';

export class CreateSubjectDto {
    @IsString()
    name: string;

    @IsEnum(SubjectCategory)
    @IsOptional()
    subjectCategory?: SubjectCategory;

    @IsNumber()
    @IsOptional()
    feeCategoryId?: number;
}
