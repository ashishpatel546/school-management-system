import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignSubjectDto {
    @ApiProperty({ example: 1, description: 'Subject ID' })
    @IsNumber()
    subjectId: number;

    @ApiProperty({ example: 1, description: 'Class ID' })
    @IsNumber()
    classId: number;

    @ApiProperty({ example: 1, description: 'Section ID' })
    @IsNumber()
    sectionId: number;
}
