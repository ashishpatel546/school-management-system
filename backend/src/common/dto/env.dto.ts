import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvDto {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  SWAGGER_ENABLED: boolean = true;
}
