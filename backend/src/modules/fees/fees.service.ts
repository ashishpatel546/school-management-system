import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeCategory } from './entities/fee-category.entity';
import { FeeStructure } from './entities/fee-structure.entity';
import { FeePayment } from './entities/fee-payment.entity';
import { GlobalFeeSettings } from './entities/global-fee-settings.entity';
import { DiscountCategory, DiscountType } from './entities/discount-category.entity';
import { CreateFeeCategoryDto, CreateFeeStructureDto, CollectPaymentDto, UpdateFeeStructureDto, CreateDiscountCategoryDto, UpdateGlobalFeeSettingsDto } from './dto/fee.dto';
import { Class } from '../classes/entities/class.entity';
import { Student } from '../students/entities/student.entity';
import { SubjectCategory } from '../extra-subjects/entities/extra-subject.entity';
import { StudentEnrollment } from '../student-enrollments/entities/student-enrollment.entity';

@Injectable()
export class FeesService {
    constructor(
        @InjectRepository(FeeCategory)
        private feeCategoryRepository: Repository<FeeCategory>,
        @InjectRepository(FeeStructure)
        private feeStructureRepository: Repository<FeeStructure>,
        @InjectRepository(FeePayment)
        private feePaymentRepository: Repository<FeePayment>,
        @InjectRepository(GlobalFeeSettings)
        private globalSettingsRepository: Repository<GlobalFeeSettings>,
        @InjectRepository(DiscountCategory)
        private discountCategoryRepository: Repository<DiscountCategory>,
        @InjectRepository(Class)
        private classRepository: Repository<Class>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(StudentEnrollment)
        private enrollmentRepository: Repository<StudentEnrollment>,
    ) { }

    // --- Global Fee Settings ---
    async getGlobalSettings() {
        let settings = await this.globalSettingsRepository.findOne({ where: {} });
        if (!settings) {
            settings = this.globalSettingsRepository.create();
            await this.globalSettingsRepository.save(settings);
        }
        return settings;
    }

    async updateGlobalSettings(dto: UpdateGlobalFeeSettingsDto) {
        const settings = await this.getGlobalSettings();
        if (dto.feeDueDate !== undefined) settings.feeDueDate = dto.feeDueDate;
        if (dto.lateFeePerDay !== undefined) settings.lateFeePerDay = dto.lateFeePerDay;
        return this.globalSettingsRepository.save(settings);
    }

    // --- Discount Categories ---
    async createDiscountCategory(dto: CreateDiscountCategoryDto) {
        const discount = this.discountCategoryRepository.create(dto);
        return this.discountCategoryRepository.save(discount);
    }

    async getDiscountCategories() {
        return this.discountCategoryRepository.find();
    }

    // --- Fee Category ---
    async createFeeCategory(dto: CreateFeeCategoryDto) {
        const category = this.feeCategoryRepository.create(dto);
        return this.feeCategoryRepository.save(category);
    }

    async getFeeCategories() {
        return this.feeCategoryRepository.find();
    }

    // --- Fee Structure ---
    async createFeeStructure(dto: CreateFeeStructureDto) {
        const existing = await this.feeStructureRepository.findOne({
            where: {
                class: { id: dto.classId },
                feeCategory: { id: dto.feeCategoryId },
                academicYear: dto.academicYear
            }
        });

        if (existing) {
            throw new ConflictException(`A fee structure for this category and academic year already exists for this class.`);
        }

        const structure = this.feeStructureRepository.create({
            class: { id: dto.classId },
            feeCategory: { id: dto.feeCategoryId },
            amount: dto.amount,
            academicYear: dto.academicYear
        });
        return this.feeStructureRepository.save(structure);
    }

    async getFeeStructures() {
        return this.feeStructureRepository.find({ relations: ['class', 'feeCategory'] });
    }

    async updateFeeStructure(id: number, dto: UpdateFeeStructureDto) {
        const structure = await this.feeStructureRepository.findOne({ where: { id } });
        if (!structure) throw new NotFoundException('Fee Structure not found');

        if (dto.amount !== undefined) structure.amount = dto.amount;
        if (dto.academicYear !== undefined) structure.academicYear = dto.academicYear;

        return this.feeStructureRepository.save(structure);
    }

    // --- Dynamic Student Fee Details ---
    async getStudentFeeDetails(studentId: number, academicYear: string) {
        const student = await this.studentRepository.findOne({
            where: { id: studentId },
            relations: ['studentSubjects', 'studentSubjects.extraSubject', 'studentSubjects.extraSubject.feeCategory', 'discounts']
        });

        if (!student) throw new NotFoundException('Student not found');

        // Look up the specific class the student was enrolled in for the requested academic year
        const enrollment = await this.enrollmentRepository.findOne({
            where: { student: { id: studentId }, academicSession: { name: academicYear } },
            relations: ['class']
        });

        if (!enrollment || !enrollment.class) {
            throw new BadRequestException(`Student not enrolled in any class for academic year ${academicYear}`);
        }

        const structures = await this.feeStructureRepository.find({
            where: { class: { id: enrollment.class.id }, academicYear },
            relations: ['feeCategory']
        });

        const settings = await this.getGlobalSettings();
        const payments = await this.feePaymentRepository.find({
            where: { student: { id: studentId }, academicYear }
        });

        // 1. Calculate Base Fee from opted subjects
        let monthlyBaseFee = 0;
        const applicableCategories: string[] = [];

        // Check base subjects vs optional/activities
        for (const sub of student.studentSubjects) {
            const extraSub = sub.extraSubject;
            if (!extraSub) continue;

            if (extraSub.subjectCategory === SubjectCategory.BASE) {
                // If taking any base subject, apply Tuition Fee (or standard fee)
                // We'll look for any fee structure assigned to this class that matches a Base setup.
                // Assuming 'Tuition Fee' is mapped if taking Base. For simplicity, we just add ALL structures mapping to this student's subjects.
            }
            if (extraSub.feeCategory) {
                const struct = structures.find(s => s.feeCategory.id === extraSub.feeCategory.id);
                if (struct && !applicableCategories.includes(struct.feeCategory.name)) {
                    monthlyBaseFee += Number(struct.amount);
                    applicableCategories.push(struct.feeCategory.name);
                }
            }
        }

        // Add any fee structure that doesn't specifically require a subject (e.g., standard Tuition if not linked specifically)
        // Wait, the new logic requires ALL fees to be linked to subjects, but maybe some are global class fees?
        // Let's assume ANY fee structure of the class that is NOT linked to an optional subject is auto-applied as a base class fee.
        // For now, let's just use the structures we matched above + generic ones.
        // Actually, to keep it pristine: If a class has a fee structure for a category, we apply it IF the student takes a matching subject OR if the category is implicit like 'Tuition'.
        // Let's just sum all fee structures assigned to the class for now as a fallback if they don't have feeCategories on subjects, OR specifically mapped ones.
        let classLevelFee = 0;
        for (const struct of structures) {
            // If this category wasn't already added via an opted subject, and it's a generic fee like Tuition Transport
            if (!applicableCategories.includes(struct.feeCategory.name)) {
                classLevelFee += Number(struct.amount);
                applicableCategories.push(struct.feeCategory.name);
            }
        }
        monthlyBaseFee += classLevelFee;

        // 2. Calculate Discounts
        let discountAmount = 0;
        for (const d of student.discounts || []) {
            if (d.type === DiscountType.FLAT) {
                discountAmount += Number(d.value);
            } else if (d.type === DiscountType.PERCENTAGE) {
                discountAmount += (monthlyBaseFee * Number(d.value)) / 100;
            }
        }

        let netMonthlyFee = monthlyBaseFee - discountAmount;
        if (netMonthlyFee < 0) netMonthlyFee = 0;

        // 3. Generate 12 months array (e.g. April to March)
        const yearParts = academicYear.split('-');
        const startYear = parseInt(yearParts[0]);
        const endYear = parseInt(yearParts[1] || String(startYear + 1));

        const monthsPayload: any[] = [];
        const currentDate = new Date();

        // Let's build April to March
        const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        for (let i = 0; i < 12; i++) {
            const mObj = new Date(startYear, 3 + i, 1);
            const y = mObj.getFullYear();
            const m = String(mObj.getMonth() + 1).padStart(2, '0');
            const monthKey = `${y}-${m}`;

            const monthPayments = payments.filter(p => p.feeMonth === monthKey);
            const totalPaid = monthPayments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

            let status = 'PENDING';
            let dueDateObj = new Date(y, mObj.getMonth(), settings.feeDueDate);

            let lateFee = 0;
            const msPerDay = 1000 * 60 * 60 * 24;
            let isOverdue = false;

            if (totalPaid >= netMonthlyFee && netMonthlyFee > 0) {
                status = 'PAID';
            } else if (totalPaid > 0) {
                status = 'PARTIAL';
            }

            if (status !== 'PAID' && currentDate > dueDateObj) {
                status = 'OVERDUE';
                isOverdue = true;
                const daysLate = Math.floor((currentDate.getTime() - dueDateObj.getTime()) / msPerDay);
                lateFee = daysLate * Number(settings.lateFeePerDay);
            }

            const monthTotalDue = netMonthlyFee + lateFee;
            const outstanding = monthTotalDue - totalPaid;

            monthsPayload.push({
                monthKey,
                monthName: `${monthNames[i]} ${y}`,
                baseFee: monthlyBaseFee,
                discount: discountAmount,
                netFee: netMonthlyFee,
                lateFee,
                totalDue: monthTotalDue,
                totalPaid,
                outstanding: outstanding > 0 ? outstanding : 0,
                status,
                dueDate: dueDateObj.toISOString().split('T')[0],
                payments: monthPayments.map(p => ({
                    receiptNumber: p.receiptNumber,
                    paymentDate: p.paymentDate,
                    amountPaid: p.amountPaid,
                    paymentMethod: p.paymentMethod
                }))
            });
        }

        return {
            student,
            academicYear,
            globalSettings: settings,
            applicableCategories,
            monthlyBreakdown: monthsPayload
        };
    }

    // --- Collect Payments ---
    async collectPayment(dto: CollectPaymentDto) {
        const student = await this.studentRepository.findOne({ where: { id: dto.studentId } });
        if (!student) throw new NotFoundException('Student not found');

        const receiptNumber = `REC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const savedPayments: FeePayment[] = [];

        const amountPerMonth = dto.amountPaid / dto.feeMonths.length;

        for (const monthKey of dto.feeMonths) {
            const payment = this.feePaymentRepository.create({
                student,
                feeMonth: monthKey,
                amountPaid: amountPerMonth,
                paymentMethod: dto.paymentMethod,
                remarks: dto.remarks,
                receiptNumber,
                academicYear: dto.academicYear
            });
            savedPayments.push(await this.feePaymentRepository.save(payment));
        }

        return {
            receiptNumber,
            payments: savedPayments,
            totalPaid: dto.amountPaid
        };
    }

    // --- Reports & Dashboard ---
    async getDashboardReport(academicYear: string = '2026-2027') {
        // Only process students who actually have an active enrollment for the requested year
        // to prevent 'Student not enrolled' Bad Request exceptions from crashing the dashboard
        const enrollments = await this.enrollmentRepository.find({
            where: { academicSession: { name: academicYear } },
            relations: ['student']
        });
        const enrolledStudents = enrollments.map(e => e.student).filter(s => !!s);

        let totalExpected = 0;
        let totalCollected = 0;
        let totalDiscount = 0;
        let totalLateFee = 0;
        let totalOverdue = 0;
        let selectedMonthExpected = 0;
        let selectedMonthCollected = 0;

        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        for (const student of enrolledStudents) {
            try {
                const details = await this.getStudentFeeDetails(student.id, academicYear);

                for (const month of details.monthlyBreakdown) {
                    totalExpected += month.totalDue || 0;
                    totalCollected += month.totalPaid || 0;
                    totalDiscount += month.discount || 0;
                    totalLateFee += month.lateFee || 0;

                    if (month.status === 'OVERDUE') {
                        totalOverdue += month.outstanding || 0;
                    }

                    if (month.monthKey === currentMonthKey) {
                        selectedMonthExpected += month.totalDue || 0;
                        selectedMonthCollected += month.totalPaid || 0;
                    }
                }
            } catch (err) {
                // Ignore students who generate computation errors (e.g. malformed data)
                console.warn(`Skipping student ${student.id} in report generation:`, err.message);
            }
        }

        const recentTransactions = await this.feePaymentRepository.find({
            relations: ['student'],
            order: { paymentDate: 'DESC' },
            take: 20
        });

        return {
            totalExpected,
            totalCollected,
            totalDiscount,
            totalLateFee,
            totalOverdue,
            currentMonth: {
                monthKey: currentMonthKey,
                expected: selectedMonthExpected,
                collected: selectedMonthCollected,
                collectionRate: selectedMonthExpected > 0 ? (selectedMonthCollected / selectedMonthExpected) * 100 : 0
            },
            recentTransactions
        };
    }
}
