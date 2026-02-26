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

export class UpdateFeeCategoryDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    isActive?: boolean;
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

import { DiscountType, DiscountApplicationType } from '../entities/discount-category.entity';

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

    @ApiProperty({ enum: DiscountApplicationType })
    @IsEnum(DiscountApplicationType)
    @IsOptional()
    applicationType?: DiscountApplicationType;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    logicReference?: string;
}

export class UpdateDiscountCategoryDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ enum: DiscountType })
    @IsEnum(DiscountType)
    @IsOptional()
    type?: DiscountType;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    value?: number;

    @ApiPropertyOptional({ enum: DiscountApplicationType })
    @IsEnum(DiscountApplicationType)
    @IsOptional()
    applicationType?: DiscountApplicationType;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    logicReference?: string;

    @ApiPropertyOptional()
    @IsOptional()
    isActive?: boolean;
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

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    discountNames?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    discountAmount?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    baseFeeAmount?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    otherFeeAmount?: number;

    @ApiProperty({ example: '2026-2027' })
    @IsString()
    @IsNotEmpty()
    academicYear: string;

    @ApiPropertyOptional()
    @IsOptional()
    feeBreakdown?: any;
}
