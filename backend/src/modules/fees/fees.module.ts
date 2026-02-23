import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { FeeCategory } from './entities/fee-category.entity';
import { FeeStructure } from './entities/fee-structure.entity';
import { FeePayment } from './entities/fee-payment.entity';
import { DiscountCategory } from './entities/discount-category.entity';
import { GlobalFeeSettings } from './entities/global-fee-settings.entity';
import { Class } from '../classes/entities/class.entity';
import { Student } from '../students/entities/student.entity';
import { StudentEnrollment } from '../student-enrollments/entities/student-enrollment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([FeeCategory, FeeStructure, FeePayment, DiscountCategory, GlobalFeeSettings, Class, Student, StudentEnrollment])],
    controllers: [FeesController],
    providers: [FeesService],
    exports: [FeesService],
})
export class FeesModule { }
