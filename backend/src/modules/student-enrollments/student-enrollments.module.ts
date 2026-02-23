import { Module } from '@nestjs/common';
import { StudentEnrollmentsService } from './student-enrollments.service';
import { StudentEnrollmentsController } from './student-enrollments.controller';

@Module({
  controllers: [StudentEnrollmentsController],
  providers: [StudentEnrollmentsService],
})
export class StudentEnrollmentsModule {}
