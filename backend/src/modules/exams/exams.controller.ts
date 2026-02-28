import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamCategoryDto } from './dto/create-exam-category.dto';
import { UpdateExamCategoryDto } from './dto/update-exam-category.dto';
import { BulkSaveMarksDto, SaveStudentMarksDto } from './dto/bulk-save-marks.dto';
import { CreateGradingSystemDto } from './dto/create-grading-system.dto';
import { UpdateGradingSystemDto } from './dto/update-grading-system.dto';

@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    // --- Exam Categories ---
    @Post('categories')
    createCategory(@Body() createDto: CreateExamCategoryDto) {
        return this.examsService.createCategory(createDto);
    }

    @Get('categories')
    findAllCategories() {
        return this.examsService.findAllCategories();
    }

    @Get('categories/active')
    findActiveCategories() {
        return this.examsService.findActiveCategories();
    }

    @Patch('categories/:id')
    updateCategory(@Param('id') id: string, @Body() updateDto: UpdateExamCategoryDto) {
        return this.examsService.updateCategory(+id, updateDto);
    }

    // --- Exam Settings ---
    @Get('settings')
    getSettings() {
        return this.examsService.getSettings();
    }

    @Patch('settings')
    updateSettings(@Body() body: any) {
        return this.examsService.updateSettings(body.contributingCategoryIds, body.finalTargetCategoryId);
    }

    // --- Grading System ---
    @Post('grading-system')
    createGradingSystem(@Body() createDto: CreateGradingSystemDto) {
        return this.examsService.createGradingSystem(createDto);
    }

    @Get('grading-system/session/:sessionId')
    findGradingSystemsBySession(@Param('sessionId') sessionId: string) {
        return this.examsService.findGradingSystemsBySession(+sessionId);
    }

    @Patch('grading-system/:id')
    updateGradingSystem(@Param('id') id: string, @Body() updateDto: UpdateGradingSystemDto) {
        return this.examsService.updateGradingSystem(+id, updateDto);
    }

    @Delete('grading-system/:id')
    deleteGradingSystem(@Param('id') id: string) {
        return this.examsService.deleteGradingSystem(+id);
    }

    // --- Dashboard ---
    @Get('dashboard')
    getDashboardStudents(@Query() query: any) {
        return this.examsService.getDashboardStudents(query);
    }

    // --- Student Exam Marks ---

    // Fetch marks for bulk entry
    @Get('marks/bulk')
    getBulkMarks(
        @Query('classId') classId: number,
        @Query('sectionId') sectionId: number,
        @Query('sessionId') sessionId: number,
        @Query('subjectId') subjectId: number,
        @Query('examCategoryId') examCategoryId: number,
    ) {
        return this.examsService.getBulkMarks(classId, sectionId, sessionId, subjectId, examCategoryId);
    }

    // Save/Update marks for bulk entry
    @Post('marks/bulk')
    bulkSaveMarks(@Body() bulkSaveDto: BulkSaveMarksDto) {
        return this.examsService.bulkSaveMarks(bulkSaveDto);
    }

    // Fetch complete result for a single student (for View modal)
    @Get('marks/:sessionId/:studentId')
    getStudentResult(
        @Param('sessionId') sessionId: string,
        @Param('studentId') studentId: string,
    ) {
        return this.examsService.getStudentResult(+sessionId, +studentId);
    }

    // Save/Update mark for a single student a single subject/exam
    @Patch('marks/student/:studentId')
    updateStudentSingleMark(
        @Param('studentId') studentId: string,
        @Body() dto: {
            classId: number;
            sectionId: number;
            sessionId: number;
            subjectId: number;
            examCategoryId: number;
            totalMarks?: number;
            obtainedMarks?: number;
            grade?: string;
            isPass?: boolean;
        },
    ) {
        return this.examsService.updateStudentSingleMark(+studentId, dto);
    }
}
