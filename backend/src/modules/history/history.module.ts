import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEnrollmentHistory } from './entities/student-enrollment-history.entity';
import { ClassTeacherHistory } from './entities/class-teacher-history.entity';
import { HistoryService } from './history.service';

@Module({
    imports: [TypeOrmModule.forFeature([StudentEnrollmentHistory, ClassTeacherHistory])],
    providers: [HistoryService],
    exports: [HistoryService],
})
export class HistoryModule { }
