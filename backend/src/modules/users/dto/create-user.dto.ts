import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsEmail()
    email: string;

    @IsEnum(UserRole)
    role: UserRole;
}
