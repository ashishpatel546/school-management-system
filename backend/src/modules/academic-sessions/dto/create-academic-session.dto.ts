import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateAcademicSessionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    startDate: string;

    @IsString()
    @IsNotEmpty()
    endDate: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
