import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../entities/fee-payment.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeeCategoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;
}

export class CreateFeeStructureDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    classId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    feeCategoryId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ example: '2026-2027' })
    @IsString()
    @IsNotEmpty()
    academicYear: string;
}

export class UpdateFeeStructureDto {
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    amount?: number;

    @ApiPropertyOptional({ example: '2026-2027' })
    @IsString()
    @IsOptional()
    academicYear?: string;
}

import { DiscountType } from '../entities/discount-category.entity';

export class CreateDiscountCategoryDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: DiscountType })
    @IsEnum(DiscountType)
    @IsNotEmpty()
    type: DiscountType;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    value: number;
}

export class UpdateGlobalFeeSettingsDto {
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    feeDueDate?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    lateFeePerDay?: number;
}

export class CollectPaymentDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    studentId: number;

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    feeMonths: string[];

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    amountPaid: number;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    remarks?: string;

    @ApiProperty({ example: '2026-2027' })
    @IsString()
    @IsNotEmpty()
    academicYear: string;
}
