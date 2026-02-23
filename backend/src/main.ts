import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './common/swagger-setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED');
  if (swaggerEnabled) {
    setupSwagger(app);
  }

  app.enableCors();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  const baseUrl = `http://localhost:${port}`;
  const swaggerUrl = `${baseUrl}/api/docs`;

  Logger.log(`=`.repeat(50), 'Bootstrap');
  Logger.log(`🚀 Base URL: ${baseUrl}`, 'Bootstrap');
  if (swaggerEnabled) {
    Logger.log(`📚 Swagger   : ${swaggerUrl}`, 'Bootstrap');
  }
  Logger.log(`=`.repeat(50), 'Bootstrap');
}
bootstrap();
