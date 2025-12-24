import { IsString } from 'class-validator';

export class CreateExtraSubjectDto {
    @IsString()
    name: string;
}
