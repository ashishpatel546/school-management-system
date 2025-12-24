import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
    @ApiProperty({ example: 'John', description: 'First name of the teacher' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the teacher' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'john.doe@school.com', description: 'Email of the teacher' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: true, description: 'Is the teacher active?', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
