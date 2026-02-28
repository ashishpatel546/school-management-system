import { PartialType } from '@nestjs/mapped-types';
import { CreateExamCategoryDto } from './create-exam-category.dto';

export class UpdateExamCategoryDto extends PartialType(CreateExamCategoryDto) { }
