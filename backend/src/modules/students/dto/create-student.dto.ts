import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    fathersName?: string;

    @IsOptional()
    @IsString()
    mothersName?: string;

    @IsOptional()
    @IsString()
    aadhaarNumber?: string;

    @IsOptional()
    @IsString()
    mobile?: string;

    @IsOptional()
    @IsString()
    alternateMobile?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @IsOptional()
    @IsString()
    religion?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    dateOfBirth?: string;

    @IsOptional()
    siblingId?: number;
}
