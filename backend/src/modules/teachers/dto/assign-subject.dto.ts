import { IsNumber, IsOptional } from 'class-validator';
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

    @ApiProperty({
        example: 1,
        description: 'Academic session ID. If not provided, the currently active session is used automatically.',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    academicSessionId?: number;
}
