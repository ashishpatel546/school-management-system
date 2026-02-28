import { IsNumber, IsOptional, IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveStudentMarksDto {
    @IsNumber()
    studentId: number;

    @IsNumber()
    @IsOptional()
    totalMarks?: number;

    @IsNumber()
    @IsOptional()
    obtainedMarks?: number;

    @IsString()
    @IsOptional()
    grade?: string;

    @IsBoolean()
    @IsOptional()
    isPass?: boolean;
}

export class BulkSaveMarksDto {
    @IsNumber()
    classId: number;

    @IsNumber()
    sectionId: number;

    @IsNumber()
    sessionId: number;

    @IsNumber()
    subjectId: number;

    @IsNumber()
    examCategoryId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaveStudentMarksDto)
    marks: SaveStudentMarksDto[];
}
