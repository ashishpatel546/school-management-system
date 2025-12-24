import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './common/config/env.validation';
import { StudentsModule } from './modules/students/students.module';
import { ExtraSubjectsModule } from './modules/extra-subjects/extra-subjects.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HistoryModule } from './modules/history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    StudentsModule,
    ExtraSubjectsModule,
    UsersModule,
    ClassesModule,
    TeachersModule,
    DashboardModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
