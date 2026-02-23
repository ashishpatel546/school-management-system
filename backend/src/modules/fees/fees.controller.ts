import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateFeeCategoryDto, CreateFeeStructureDto, CollectPaymentDto, UpdateFeeStructureDto, CreateDiscountCategoryDto, UpdateGlobalFeeSettingsDto } from './dto/fee.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Fees')
@Controller('fees')
export class FeesController {
    constructor(private readonly feesService: FeesService) { }

    @ApiOperation({ summary: 'Get global fee settings' })
    @Get('settings')
    getGlobalSettings() {
        return this.feesService.getGlobalSettings();
    }

    @ApiOperation({ summary: 'Update global fee settings' })
    @Put('settings')
    updateGlobalSettings(@Body() dto: UpdateGlobalFeeSettingsDto) {
        return this.feesService.updateGlobalSettings(dto);
    }

    @ApiOperation({ summary: 'Create a discount category' })
    @Post('discounts')
    createDiscountCategory(@Body() dto: CreateDiscountCategoryDto) {
        return this.feesService.createDiscountCategory(dto);
    }

    @ApiOperation({ summary: 'Get all discount categories' })
    @Get('discounts')
    getDiscountCategories() {
        return this.feesService.getDiscountCategories();
    }

    @ApiOperation({ summary: 'Create a new fee category (e.g. Tuition, Curriculum)' })
    @Post('categories')
    createFeeCategory(@Body() dto: CreateFeeCategoryDto) {
        return this.feesService.createFeeCategory(dto);
    }

    @ApiOperation({ summary: 'Get all fee categories' })
    @Get('categories')
    getFeeCategories() {
        return this.feesService.getFeeCategories();
    }

    @ApiOperation({ summary: 'Create a fee structure for a class' })
    @Post('structures')
    createFeeStructure(@Body() dto: CreateFeeStructureDto) {
        return this.feesService.createFeeStructure(dto);
    }

    @ApiOperation({ summary: 'Get all fee structures' })
    @Get('structures')
    getFeeStructures() {
        return this.feesService.getFeeStructures();
    }

    @ApiOperation({ summary: 'Update an existing fee structure' })
    @Put('structures/:id')
    updateFeeStructure(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFeeStructureDto) {
        return this.feesService.updateFeeStructure(id, dto);
    }

    @ApiOperation({ summary: 'Get dynamic 12-month fee details for a specific student' })
    @ApiQuery({ name: 'academicYear', required: false, example: '2026-2027' })
    @Get('student/:studentId')
    getStudentFees(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('academicYear') academicYear: string = '2026-2027'
    ) {
        return this.feesService.getStudentFeeDetails(studentId, academicYear);
    }

    @ApiOperation({ summary: 'Process a fee payment and generate receipt for multiple months' })
    @Post('pay')
    collectPayment(@Body() dto: CollectPaymentDto) {
        return this.feesService.collectPayment(dto);
    }

    @ApiOperation({ summary: 'Get comprehensive fee dashboard report metrics' })
    @ApiQuery({ name: 'academicYear', required: false, example: '2026-2027' })
    @Get('reports/dashboard')
    getDashboardReport(@Query('academicYear') academicYear: string = '2026-2027') {
        return this.feesService.getDashboardReport(academicYear);
    }
}
