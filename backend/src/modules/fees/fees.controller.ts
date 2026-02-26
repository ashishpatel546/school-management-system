import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, Patch } from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateFeeCategoryDto, CreateFeeStructureDto, CollectPaymentDto, UpdateFeeStructureDto, CreateDiscountCategoryDto, UpdateGlobalFeeSettingsDto, UpdateDiscountCategoryDto, UpdateFeeCategoryDto } from './dto/fee.dto';
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

    @ApiOperation({ summary: 'Update a discount category' })
    @Put('discounts/:id')
    updateDiscountCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDiscountCategoryDto) {
        return this.feesService.updateDiscountCategory(id, dto);
    }

    @ApiOperation({ summary: 'Toggle status of a discount category' })
    @Patch('discounts/:id/toggle-status')
    toggleDiscountCategoryStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
        return this.feesService.toggleDiscountCategoryStatus(id, isActive);
    }

    @ApiOperation({ summary: 'Delete a discount category' })
    @Delete('discounts/:id')
    deleteDiscountCategory(@Param('id', ParseIntPipe) id: number) {
        return this.feesService.deleteDiscountCategory(id);
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

    @ApiOperation({ summary: 'Update a fee category' })
    @Put('categories/:id')
    updateFeeCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFeeCategoryDto) {
        return this.feesService.updateFeeCategory(id, dto);
    }

    @ApiOperation({ summary: 'Toggle status of a fee category' })
    @Patch('categories/:id/toggle-status')
    toggleFeeCategoryStatus(@Param('id', ParseIntPipe) id: number, @Body('isActive') isActive: boolean) {
        return this.feesService.toggleFeeCategoryStatus(id, isActive);
    }

    @ApiOperation({ summary: 'Delete a fee category' })
    @Delete('categories/:id')
    deleteFeeCategory(@Param('id', ParseIntPipe) id: number) {
        return this.feesService.deleteFeeCategory(id);
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

    @ApiOperation({ summary: 'Delete an existing fee structure' })
    @Delete('structures/:id')
    deleteFeeStructure(@Param('id', ParseIntPipe) id: number) {
        return this.feesService.deleteFeeStructure(id);
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
