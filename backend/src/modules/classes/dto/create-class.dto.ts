import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
    @ApiProperty({ example: 'Class 10', description: 'The name of the class' })
    @IsString()
    @IsNotEmpty()
    name: string;
}
