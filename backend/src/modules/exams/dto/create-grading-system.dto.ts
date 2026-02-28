import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateGradingSystemDto {
    @IsNotEmpty()
    @IsNumber()
    sessionId: number;

    @IsNotEmpty()
    @IsString()
    gradeName: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(100)
    minPercentage: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(100)
    maxPercentage: number;

    @IsOptional()
    @IsBoolean()
    isFailGrade?: boolean;
}
