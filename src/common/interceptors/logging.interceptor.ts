import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params } = request;

    // Tạo request ID unique
    const requestId = randomUUID();
    request['requestId'] = requestId;

    const startTime = Date.now();

    // Log request
    this.logger.log(
      `📥 [${requestId}] NHẬN REQUEST\n` +
        `   Method: ${method}\n` +
        `   URL: ${url}\n` +
        `   Body: ${JSON.stringify(body)}\n` +
        `   Query: ${JSON.stringify(query)}\n` +
        `   Params: ${JSON.stringify(params)}`,
    );

    // Thêm request ID vào response header
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const duration = Date.now() - startTime;

          // Thêm metadata vào response để frontend có thể log
          if (data && typeof data === 'object') {
            data._meta = {
              requestId,
              duration: `${duration}ms`,
              timestamp: new Date().toISOString(),
            };
          }

          // Log response thành công
          this.logger.log(
            `📤 [${requestId}] GỬI RESPONSE\n` +
              `   Status: ${response.statusCode}\n` +
              `   Duration: ${duration}ms\n` +
              `   Data: ${JSON.stringify(data).substring(0, 200)}${JSON.stringify(data).length > 200 ? '...' : ''}`,
          );
        },
        error: (error: any) => {
          const duration = Date.now() - startTime;
          // Log error
          this.logger.error(
            `❌ [${requestId}] LỖI RESPONSE\n` +
              `   Status: ${error.status || 500}\n` +
              `   Duration: ${duration}ms\n` +
              `   Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
