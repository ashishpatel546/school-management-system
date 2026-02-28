import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExamCategory } from './entities/exam-category.entity';
import { ExamSetting } from './entities/exam-setting.entity';
import { StudentExamMarks } from './entities/student-exam-marks.entity';
import { GradingSystem } from './entities/grading-system.entity';
import { CreateExamCategoryDto } from './dto/create-exam-category.dto';
import { UpdateExamCategoryDto } from './dto/update-exam-category.dto';
import { BulkSaveMarksDto } from './dto/bulk-save-marks.dto';
import { CreateGradingSystemDto } from './dto/create-grading-system.dto';
import { UpdateGradingSystemDto } from './dto/update-grading-system.dto';
import { StudentEnrollment } from '../student-enrollments/entities/student-enrollment.entity';
import { StudentsService } from '../students/students.service';

@Injectable()
export class ExamsService {
    constructor(
        @InjectRepository(ExamCategory)
        private categoryRepo: Repository<ExamCategory>,
        @InjectRepository(ExamSetting)
        private settingRepo: Repository<ExamSetting>,
        @InjectRepository(StudentExamMarks)
        private marksRepo: Repository<StudentExamMarks>,
        @InjectRepository(StudentEnrollment)
        private enrollmentRepo: Repository<StudentEnrollment>,
        @InjectRepository(GradingSystem)
        private gradingSystemRepo: Repository<GradingSystem>,
        private studentsService: StudentsService
    ) { }

    // --- Exam Categories ---
    async createCategory(dto: CreateExamCategoryDto) {
        const category = this.categoryRepo.create(dto);
        return this.categoryRepo.save(category);
    }

    async findAllCategories() {
        return this.categoryRepo.find({ order: { createdAt: 'ASC' } });
    }

    async findActiveCategories() {
        return this.categoryRepo.find({ where: { isActive: true }, order: { createdAt: 'ASC' } });
    }

    async updateCategory(id: number, dto: UpdateExamCategoryDto) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) throw new NotFoundException('Exam Category not found');

        Object.assign(category, dto);
        return this.categoryRepo.save(category);
    }

    // --- Exam Settings ---
    async getSettings(): Promise<ExamSetting> {
        const settingsList = await this.settingRepo.find();
        if (settingsList.length === 0) {
            // Create default
            const setting = this.settingRepo.create({ contributingCategoryIds: [], finalTargetCategoryId: null as any });
            return this.settingRepo.save(setting);
        }
        return settingsList[0];
    }

    async updateSettings(contributingCategoryIds: number[], finalTargetCategoryId: number | null) {
        let setting = await this.getSettings();
        setting.contributingCategoryIds = contributingCategoryIds || [];
        setting.finalTargetCategoryId = finalTargetCategoryId || null;
        return this.settingRepo.save(setting);
    }

    // --- Dashboard ---
    async getDashboardStudents(query: any) {
        // Query base students list using the same complex logic as the existing grid
        const resultOrArray: any = await this.studentsService.findAll(query);
        const isPaginated = !!(query.page && query.limit);
        const students = isPaginated ? resultOrArray.data : resultOrArray;
        const total = isPaginated ? resultOrArray.total : students.length;

        const sessionId = query.academicSessionId ? parseInt(query.academicSessionId) : null;

        // Always flatten user properties so the Grid renderer never gets 'undefined' names
        const mappedStudents = students.map((student: any) => {
            const { user, ...rest } = student;
            const result: any = { ...rest, ...(user || {}) };
            result.id = student.id; // ensure ID from student prevails
            return result;
        });

        if (!sessionId || mappedStudents.length === 0) {
            if (isPaginated) return { data: mappedStudents, total, page: parseInt(query.page), limit: parseInt(query.limit) };
            return mappedStudents;
        }

        const studentIds = mappedStudents.map((s: any) => s.id);

        // Fetch ALL marks for these students in this session to prevent N+1 queries
        const allMarks = await this.marksRepo.find({
            where: {
                student: { id: In(studentIds) },
                session: { id: sessionId },
            },
            relations: ['student', 'examCategory']
        });

        const activeCategories = await this.findActiveCategories();

        // Group marks continuously by student ID
        const studentMarksMap = new Map<number, StudentExamMarks[]>();
        for (const mark of allMarks) {
            if (!studentMarksMap.has(mark.student.id)) {
                studentMarksMap.set(mark.student.id, []);
            }
            studentMarksMap.get(mark.student.id)!.push(mark);
        }

        // Map the results back to the student records
        const finalResults = mappedStudents.map((result: any) => {
            const marks = studentMarksMap.get(result.id) || [];

            for (const cat of activeCategories) {
                // Determine their specific aggregated percentage for this category
                const catMarks = marks.filter(m => m.examCategory.id === cat.id && m.totalMarks != null && m.obtainedMarks != null);

                let sumTotal = 0;
                let sumObtained = 0;
                for (const cm of catMarks) {
                    sumTotal += Number(cm.totalMarks);
                    sumObtained += Number(cm.obtainedMarks);
                }

                let catPercentage: number | null = null;
                if (catMarks.length > 0 && sumTotal > 0) {
                    catPercentage = parseFloat(((sumObtained * 100) / sumTotal).toFixed(2));
                }

                // Add as a flat property so the data grid can cleanly map columns directly: `category_5_percentage`
                result[`category_${cat.id}_percentage`] = catPercentage;
            }

            return result;
        });

        // Data mapped at the top now flows properly to the end, total is already calculated

        if (isPaginated) {
            return { data: finalResults, total, page: parseInt(query.page), limit: parseInt(query.limit) };
        }
        return finalResults;
    }

    // --- Grading System ---
    private async checkGradingOverlap(sessionId: number, minPercentage: number, maxPercentage: number, excludeId?: number) {
        if (minPercentage >= maxPercentage) {
            throw new BadRequestException('Min percentage must be strictly less than max percentage');
        }
        const existing = await this.gradingSystemRepo.find({ where: { session: { id: sessionId } } });
        for (const g of existing) {
            if (excludeId && g.id === excludeId) continue;

            // Check for overlap: max(minA, minB) < min(maxA, maxB) defines an overlapping interval
            const overlap = Math.max(minPercentage, g.minPercentage) < Math.min(maxPercentage, g.maxPercentage);
            if (overlap) {
                throw new BadRequestException(`Grade range overlaps with existing grade '${g.gradeName}' (${g.minPercentage}% - ${g.maxPercentage}%)`);
            }
        }
    }

    async createGradingSystem(dto: CreateGradingSystemDto) {
        await this.checkGradingOverlap(dto.sessionId, dto.minPercentage, dto.maxPercentage);

        const grading = this.gradingSystemRepo.create({
            ...dto,
            session: { id: dto.sessionId }
        });
        return this.gradingSystemRepo.save(grading);
    }

    async findGradingSystemsBySession(sessionId: number) {
        return this.gradingSystemRepo.find({
            where: { session: { id: sessionId } },
            order: { minPercentage: 'DESC' } // typical to show highest grades first
        });
    }

    async updateGradingSystem(id: number, dto: UpdateGradingSystemDto) {
        const grading = await this.gradingSystemRepo.findOne({ where: { id }, relations: ['session'] });
        if (!grading) throw new NotFoundException('Grading System not found');

        const newMin = dto.minPercentage !== undefined ? dto.minPercentage : grading.minPercentage;
        const newMax = dto.maxPercentage !== undefined ? dto.maxPercentage : grading.maxPercentage;

        if (dto.minPercentage !== undefined || dto.maxPercentage !== undefined) {
            await this.checkGradingOverlap(grading.session.id, newMin, newMax, id);
        }

        Object.assign(grading, dto);
        return this.gradingSystemRepo.save(grading);
    }

    async deleteGradingSystem(id: number) {
        const grading = await this.gradingSystemRepo.findOne({ where: { id } });
        if (!grading) throw new NotFoundException('Grading System not found');
        return this.gradingSystemRepo.remove(grading);
    }

    // --- Student Exam Marks ---

    // For Bulk Entry: Get students enrolled in a class/section and their optional existing marks
    async getBulkMarks(classId: number, sectionId: number, sessionId: number, subjectId: number, examCategoryId: number) {
        if (!classId || !sectionId || !sessionId || !subjectId || !examCategoryId) {
            throw new BadRequestException('Missing required parameters');
        }

        // Get enrollments (which imply students in the class/section for the session)
        const enrollments = await this.enrollmentRepo.find({
            where: {
                student: { class: { id: classId }, section: { id: sectionId } },
                academicSession: { id: sessionId },
            },
            relations: ['student', 'student.user'],
        });

        // Get existing marks
        const existingMarks = await this.marksRepo.find({
            where: {
                class: { id: classId },
                section: { id: sectionId },
                session: { id: sessionId },
                subject: { id: subjectId },
                examCategory: { id: examCategoryId },
            },
            relations: ['student'],
        });

        const marksMap = new Map();
        for (const mark of existingMarks) {
            marksMap.set(mark.student.id, mark);
        }

        const data = enrollments.map(enrol => {
            const stu = enrol.student;
            const mark = marksMap.get(stu.id);
            return {
                studentId: stu.id,
                studentName: stu.user ? `${stu.user.firstName} ${stu.user.lastName}` : `Student #${stu.id}`,
                rollNo: enrol.rollNo,
                totalMarks: mark?.totalMarks ?? null,
                obtainedMarks: mark?.obtainedMarks ?? null,
                percentage: mark?.percentage ?? null,
                grade: mark?.grade ?? '',
                isPass: mark?.isPass ?? null,
            };
        });

        // Sort by roll number if available
        data.sort((a, b) => {
            if (a.rollNo && b.rollNo) return a.rollNo - b.rollNo;
            return 0;
        });

        return data;
    }

    // Bulk save
    async bulkSaveMarks(dto: BulkSaveMarksDto) {
        const { classId, sectionId, sessionId, subjectId, examCategoryId, marks } = dto;

        let savedCount = 0;
        for (const m of marks) {
            let record = await this.marksRepo.findOne({
                where: {
                    student: { id: m.studentId },
                    class: { id: classId },
                    section: { id: sectionId },
                    session: { id: sessionId },
                    subject: { id: subjectId },
                    examCategory: { id: examCategoryId },
                }
            });

            if (!record) {
                record = this.marksRepo.create({
                    student: { id: m.studentId },
                    class: { id: classId },
                    section: { id: sectionId },
                    session: { id: sessionId },
                    subject: { id: subjectId },
                    examCategory: { id: examCategoryId },
                });
            }

            // Always update raw numbers if provided
            if (m.totalMarks !== undefined) record.totalMarks = m.totalMarks;
            if (m.obtainedMarks !== undefined) record.obtainedMarks = m.obtainedMarks;

            if (record.totalMarks != null && record.obtainedMarks != null && record.obtainedMarks > record.totalMarks) {
                throw new BadRequestException(`Obtained marks cannot exceed Total marks for student ID ${m.studentId}`);
            }

            // Strict Backend Calculation for Percentage, Grade, Pass/Fail
            if (record.totalMarks != null && record.totalMarks > 0 && record.obtainedMarks != null) {
                record.percentage = (record.obtainedMarks * 100) / record.totalMarks;

                // Fetch grading bands for this session (could be optimized outside the loop ideally, but safe here)
                const gradings = await this.findGradingSystemsBySession(sessionId);

                let assignedGrade: GradingSystem | null = null;
                for (const g of gradings) {
                    if (record.percentage >= g.minPercentage && record.percentage <= g.maxPercentage) {
                        assignedGrade = g;
                        break;
                    }
                }

                if (assignedGrade) {
                    record.grade = assignedGrade.gradeName;
                    record.isPass = !assignedGrade.isFailGrade;
                } else {
                    record.grade = '';
                    record.isPass = false;
                }
            } else {
                record.percentage = 0;
                record.grade = '';
                record.isPass = false;
            }

            await this.marksRepo.save(record);
            savedCount++;

            // Trigger final aggregation explicitly asynchronously
            this.assessAndGenerateFinalMark(m.studentId, subjectId, sessionId, classId, sectionId, examCategoryId).catch(console.error);
        }

        return { message: 'Marks updated successfully', count: savedCount };
    }

    // For Modal: get all marks for a student for a session across all subjects and exam categories
    async getStudentResult(sessionId: number, studentId: number) {
        const marks = await this.marksRepo.find({
            where: {
                student: { id: studentId },
                session: { id: sessionId },
            },
            relations: ['subject', 'examCategory'],
        });

        return marks.map(m => ({
            id: m.id,
            subjectId: m.subject.id,
            subjectName: m.subject.name,
            examCategoryId: m.examCategory.id,
            examCategoryName: m.examCategory.name,
            totalMarks: m.totalMarks,
            obtainedMarks: m.obtainedMarks,
            percentage: m.percentage,
            grade: m.grade,
            isPass: m.isPass,
        }));
    }

    // Helper for saving a single student's subject mark from the modal
    async updateStudentSingleMark(studentId: number, dto: any) {
        const { classId, sectionId, sessionId, subjectId, examCategoryId, ...updates } = dto;

        let record = await this.marksRepo.findOne({
            where: {
                student: { id: studentId },
                class: { id: classId },
                section: { id: sectionId },
                session: { id: sessionId },
                subject: { id: subjectId },
                examCategory: { id: examCategoryId },
            }
        });

        if (!record) {
            record = this.marksRepo.create({
                student: { id: studentId },
                class: { id: classId },
                section: { id: sectionId },
                session: { id: sessionId },
                subject: { id: subjectId },
                examCategory: { id: examCategoryId },
            });
        }

        // Always update raw numbers if provided
        if (updates.totalMarks !== undefined) record.totalMarks = updates.totalMarks;
        if (updates.obtainedMarks !== undefined) record.obtainedMarks = updates.obtainedMarks;

        if (record.totalMarks != null && record.obtainedMarks != null && record.obtainedMarks > record.totalMarks) {
            throw new BadRequestException(`Obtained marks cannot exceed Total marks.`);
        }

        // Strict Backend Calculation for Percentage, Grade, Pass/Fail
        if (record.totalMarks != null && record.totalMarks > 0 && record.obtainedMarks != null) {
            record.percentage = (record.obtainedMarks * 100) / record.totalMarks;

            const gradings = await this.findGradingSystemsBySession(sessionId);

            let assignedGrade: GradingSystem | null = null;
            for (const g of gradings) {
                if (record.percentage >= g.minPercentage && record.percentage <= g.maxPercentage) {
                    assignedGrade = g;
                    break;
                }
            }

            if (assignedGrade) {
                record.grade = assignedGrade.gradeName;
                record.isPass = !assignedGrade.isFailGrade;
            } else {
                record.grade = '';
                record.isPass = false;
            }
        } else {
            record.percentage = 0;
            record.grade = '';
            record.isPass = false;
        }

        const savedRecord = await this.marksRepo.save(record);

        // Trigger final aggregation
        this.assessAndGenerateFinalMark(studentId, subjectId, sessionId, classId, sectionId, examCategoryId).catch(console.error);

        return savedRecord;
    }

    private async assessAndGenerateFinalMark(studentId: number, subjectId: number, sessionId: number, classId: number, sectionId: number, savedCategoryId: number) {
        // Coerce all IDs to proper numbers (HTTP query params can sometimes be strings)
        studentId = Number(studentId);
        subjectId = Number(subjectId);
        sessionId = Number(sessionId);
        classId = Number(classId);
        sectionId = Number(sectionId);
        savedCategoryId = Number(savedCategoryId);

        const settings = await this.getSettings();
        if (!settings.finalTargetCategoryId || !settings.contributingCategoryIds || settings.contributingCategoryIds.length === 0) {
            return; // Not configured
        }

        // Normalize stored IDs to numbers too (JSONB can store as numbers but safety check)
        const contributingIds = (settings.contributingCategoryIds || []).map(Number);

        // If the mark we just saved isn't a contributing category, do nothing
        if (!contributingIds.includes(savedCategoryId)) {
            return;
        }

        // Fetch all marks for this student + subject + session
        const allMarks = await this.marksRepo.find({
            where: {
                student: { id: studentId },
                subject: { id: subjectId },
                session: { id: sessionId }
            },
            relations: ['examCategory']
        });

        // Filter valid contributing marks
        const contributingMarks = allMarks.filter(m =>
            contributingIds.includes(Number(m.examCategory.id)) &&
            m.totalMarks != null && m.totalMarks > 0 &&
            m.obtainedMarks != null
        );

        // Check if we have complete data from all required contributing categories
        if (contributingMarks.length === contributingIds.length) {
            let sumTotal = 0;
            let sumObtained = 0;

            for (const cm of contributingMarks) {
                sumTotal += Number(cm.totalMarks);
                sumObtained += Number(cm.obtainedMarks);
            }

            // Find or create the final target mark record
            let finalRecord = await this.marksRepo.findOne({
                where: {
                    student: { id: studentId },
                    subject: { id: subjectId },
                    session: { id: sessionId },
                    examCategory: { id: settings.finalTargetCategoryId }
                }
            });

            if (!finalRecord) {
                finalRecord = this.marksRepo.create({
                    student: { id: studentId },
                    class: { id: classId },      // Assuming these remain stable
                    section: { id: sectionId },
                    session: { id: sessionId },
                    subject: { id: subjectId },
                    examCategory: { id: settings.finalTargetCategoryId },
                });
            }

            finalRecord.totalMarks = sumTotal;
            finalRecord.obtainedMarks = sumObtained;

            // Recalculate Percentage/Grade using the standard pure logic
            if (sumTotal > 0) {
                finalRecord.percentage = (sumObtained * 100) / sumTotal;
                const gradings = await this.findGradingSystemsBySession(sessionId);

                let assignedGrade: GradingSystem | null = null;
                for (const g of gradings) {
                    if (finalRecord.percentage >= g.minPercentage && finalRecord.percentage <= g.maxPercentage) {
                        assignedGrade = g;
                        break;
                    }
                }

                if (assignedGrade) {
                    finalRecord.grade = assignedGrade.gradeName;
                    finalRecord.isPass = !assignedGrade.isFailGrade;
                } else {
                    finalRecord.grade = '';
                    finalRecord.isPass = false;
                }
            } else {
                finalRecord.percentage = 0;
                finalRecord.grade = '';
                finalRecord.isPass = false;
            }

            await this.marksRepo.save(finalRecord);
        }
    }
}
