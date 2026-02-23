import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
    @ApiProperty({ example: 'Class 10', description: 'The name of the class' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'List of sections to create with the class' })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateSectionWithTeacherDto)
    sections?: CreateSectionWithTeacherDto[];
}

export class CreateSectionWithTeacherDto {
    @ApiProperty({ example: 'Section A', description: 'Name of the section' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 1, description: 'ID of the class teacher', required: false })
    @IsNumber()
    @IsOptional()
    teacherId?: number;
}
