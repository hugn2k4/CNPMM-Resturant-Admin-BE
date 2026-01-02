import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ['X-Request-ID'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Global prefix cho tất cả API
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các field không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có field không hợp lệ
      transform: true, // Tự động chuyển đổi kiểu dữ liệu
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor (phải đặt trước transform interceptor)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global response interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Seed default admin user on startup
  const seedService = app.get(SeedService);
  await seedService.seedAdminUser();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
