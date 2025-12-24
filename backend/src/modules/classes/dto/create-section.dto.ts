import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
    @ApiProperty({ example: 'Section A', description: 'The name of the section' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 1, description: 'The ID of the class this section belongs to' })
    @IsNumber()
    classId: number;
}
